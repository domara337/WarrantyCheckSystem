import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { MainLayout } from '../components/layout/MainLayout';
import { deleteWarrantyRecord, getAllWarrantyRecords, updateWarrantyRecord } from '../api/warranty';
import type { FullWarrantyRecord } from '../types';

interface RecordDraft {
  serial_number: string;
  label_id: string;
  warranty_months: string;
  warranty_start_date: string;
}

const PAGE_SIZE = 25;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

const formatDate = (value: string): string => {
  const dateValue = value.slice(0, 10);
  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? dateValue
    : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

const addMonths = (dateValue: string, months: number): string => {
  const [year, month, day] = dateValue.split('-').map(Number);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = targetMonthIndex % 12;
  const lastDayOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(day, lastDayOfMonth);

  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
};

const getRecordStatus = (record: FullWarrantyRecord): string => {
  if (record.status) return record.status;
  return record.warranty_end_date.slice(0, 10) < new Date().toISOString().slice(0, 10) ? 'Expired' : 'Active';
};

const FullRecordsSheet: React.FC = () => {
  const [records, setRecords] = useState<FullWarrantyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<FullWarrantyRecord | null>(null);
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [busyRecordId, setBusyRecordId] = useState<string | number | null>(null);

  const refreshRecords = useCallback(async () => {
    try {
      setRecords(await getAllWarrantyRecords());
      setError('');
    } catch (loadError) {
      console.error('Failed to load warranty records:', loadError);
      setError(getErrorMessage(loadError, 'Unable to load records. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAllWarrantyRecords()
      .then((items) => {
        if (active) setRecords(items);
      })
      .catch((loadError: unknown) => {
        console.error('Failed to load warranty records:', loadError);
        if (active) setError(getErrorMessage(loadError, 'Unable to load records. Please try again.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      [
        record.serial_number,
        record.label_id,
        record.model_name,
        record.part_number,
        record.branch_name,
        record.customer_name ?? '',
        record.customer_mobile ?? '',
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [records, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, pageCount);
  const paginatedRecords = useMemo(() => {
    const startIndex = (visiblePage - 1) * PAGE_SIZE;
    return filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRecords, visiblePage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditing = (record: FullWarrantyRecord) => {
    setEditingRecord(record);
    setDraft({
      serial_number: record.serial_number,
      label_id: record.label_id,
      warranty_months: String(record.warranty_months),
      warranty_start_date: record.warranty_start_date.slice(0, 10),
    });
    setError('');
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingRecord || !draft) return;

    const warrantyMonths = Number(draft.warranty_months);
    if (!Number.isInteger(warrantyMonths) || warrantyMonths < 1) {
      setError('Warranty duration must be a positive whole number of months.');
      return;
    }

    setBusyRecordId(editingRecord.id);
    setError('');
    try {
      await updateWarrantyRecord(editingRecord.id, {
        serial_number: draft.serial_number.trim(),
        label_id: draft.label_id.trim(),
        warranty_months: warrantyMonths,
        warranty_start_date: draft.warranty_start_date,
        warranty_end_date: addMonths(draft.warranty_start_date, warrantyMonths),
      });
      setEditingRecord(null);
      setDraft(null);
      await refreshRecords();
    } catch (updateError) {
      console.error('Failed to update warranty record:', updateError);
      setError(getErrorMessage(updateError, 'Unable to update this record. Please try again.'));
    } finally {
      setBusyRecordId(null);
    }
  };

  const handleDelete = async (record: FullWarrantyRecord) => {
    if (!window.confirm(`Delete the record for serial number "${record.serial_number}"? This cannot be undone.`)) return;

    setBusyRecordId(record.id);
    setError('');
    try {
      await deleteWarrantyRecord(record.id);
      setRecords((currentRecords) => currentRecords.filter((item) => item.id !== record.id));
    } catch (deleteError) {
      console.error('Failed to delete warranty record:', deleteError);
      setError(getErrorMessage(deleteError, 'Unable to delete this record. Please try again.'));
    } finally {
      setBusyRecordId(null);
    }
  };

  return (
    <MainLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Records</h1>
            <p className="mt-1 text-sm text-slate-500">View, update, and delete warranty records.</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <Input
              label="Search records"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Serial, label, product, branch, or customer"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">All warranty records</h2>
            <span className="text-sm text-slate-500">{filteredRecords.length} of {records.length}</span>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              {records.length === 0 ? 'No records found.' : 'No records match your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/60">
                  <tr>
                    <th className="px-5 py-3">Serial / Label</th>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Branch</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Warranty</th>
                    <th className="px-5 py-3">Installation</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedRecords.map((record) => {
                    const latestInstallation = record.installations[0];
                    const status = getRecordStatus(record);
                    const isBusy = busyRecordId === record.id;
                    return (
                      <tr key={record.id} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{record.serial_number}</p>
                          <p className="mt-1 text-xs text-slate-500">Label: {record.label_id}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{record.model_name}</p>
                          <p className="mt-1 text-xs text-slate-500">{record.part_number}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{record.branch_name}</td>
                        <td className="px-5 py-4">
                          <p className="text-slate-700 dark:text-slate-300">{record.customer_name || '—'}</p>
                          {record.customer_mobile && <p className="mt-1 text-xs text-slate-500">{record.customer_mobile}</p>}
                        </td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                          <p>{record.warranty_months} months</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(record.warranty_start_date)} – {formatDate(record.warranty_end_date)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                          {latestInstallation ? (
                            <>
                              <p>{formatDate(latestInstallation.installation_date)}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {[latestInstallation.version, latestInstallation.size && `${latestInstallation.size}"`]
                                  .filter(Boolean)
                                  .join(' · ') || 'Details not provided'}
                              </p>
                            </>
                          ) : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            status.toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" disabled={isBusy} onClick={() => startEditing(record)}>
                              Update
                            </Button>
                            <Button type="button" variant="danger" disabled={isBusy} onClick={() => void handleDelete(record)}>
                              {isBusy ? 'Working...' : 'Delete'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredRecords.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {(visiblePage - 1) * PAGE_SIZE + 1}–{Math.min(visiblePage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              {pageCount > 1 && (
                <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Records pages">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5"
                    disabled={visiblePage === 1}
                    onClick={() => goToPage(visiblePage - 1)}
                    aria-label="Go to previous page"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      type="button"
                      variant={pageNumber === visiblePage ? 'primary' : 'outline'}
                      className="min-w-9 px-3 py-1.5"
                      onClick={() => goToPage(pageNumber)}
                      aria-label={`Go to page ${pageNumber}`}
                      aria-current={pageNumber === visiblePage ? 'page' : undefined}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5"
                    disabled={visiblePage === pageCount}
                    onClick={() => goToPage(visiblePage + 1)}
                    aria-label="Go to next page"
                  >
                    Next
                  </Button>
                </nav>
              )}
            </div>
          )}
        </div>
      </section>

      {editingRecord && draft && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && busyRecordId === null) {
              setEditingRecord(null);
              setDraft(null);
            }
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-record-title"
            onSubmit={handleUpdate}
            className="w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <div>
              <h2 id="edit-record-title" className="text-lg font-semibold text-slate-900 dark:text-white">Update record</h2>
              <p className="mt-1 text-sm text-slate-500">{editingRecord.model_name} · {editingRecord.part_number}</p>
            </div>
            <Input
              label="Serial number"
              value={draft.serial_number}
              onChange={(event) => setDraft({ ...draft, serial_number: event.target.value })}
              required
            />
            <Input
              label="Label ID"
              value={draft.label_id}
              onChange={(event) => setDraft({ ...draft, label_id: event.target.value })}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Warranty start date"
                type="date"
                value={draft.warranty_start_date}
                onChange={(event) => setDraft({ ...draft, warranty_start_date: event.target.value })}
                required
              />
              <Input
                label="Warranty duration (months)"
                type="number"
                min={1}
                step={1}
                value={draft.warranty_months}
                onChange={(event) => setDraft({ ...draft, warranty_months: event.target.value })}
                required
              />
            </div>
            {error && (
              <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                disabled={busyRecordId !== null}
                onClick={() => {
                  setEditingRecord(null);
                  setDraft(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={busyRecordId === editingRecord.id}>
                Save changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
};

export default FullRecordsSheet;