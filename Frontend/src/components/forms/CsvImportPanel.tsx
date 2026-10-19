import React, { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { createProductEntry, getAllWarrantyRecords } from '../../api/warranty';
import { Button } from '../common/Button';
import {
  createWarrantyRecordsCsv,
  parseProductCsv,
  type CsvImportIssue,
  type ParsedProductCsv,
} from '../../utils/csvImport';

interface CsvImportPanelProps {
  onImported: () => void;
}

interface ImportFailure {
  row?: number;
  message: string;
}

const getErrorMessage = (error: unknown, fallback = 'The server rejected this row.'): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

const downloadCsv = (content: string) => {
  const csv = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(csv);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'warranty-records.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const CsvImportPanel: React.FC<CsvImportPanelProps> = ({ onImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<ParsedProductCsv['entries'] | null>(null);
  const [fileIssues, setFileIssues] = useState<CsvImportIssue[]>([]);
  const [fileError, setFileError] = useState('');
  const [importFailures, setImportFailures] = useState<ImportFailure[]>([]);
  const [skippedRows, setSkippedRows] = useState<ImportFailure[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError('');

    try {
      const records = await getAllWarrantyRecords();
      downloadCsv(createWarrantyRecordsCsv(records));
    } catch (error) {
      setExportError(getErrorMessage(error, 'Unable to retrieve warranty records.'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setEntries(null);
    setFileIssues([]);
    setFileError('');
    setImportFailures([]);
    setImportedCount(null);
    setProgress(0);

    try {
      const parsed = parseProductCsv(await file.text());
      setEntries(parsed.entries);
      setFileIssues(parsed.issues);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'Unable to read this CSV file.');
    }
  };

  const handleImport = async () => {
    if (!entries?.length || isImporting) return;

    setIsImporting(true);
    setProgress(0);
    setImportFailures([]);
    setSkippedRows([]);
    setImportedCount(0);
    const failures: ImportFailure[] = [];
    const skipped: ImportFailure[] = [];
    let successfulImports = 0;

    let existingSerialNumbers: Set<string>;
    try {
      const existingRecords = await getAllWarrantyRecords();
      existingSerialNumbers = new Set(existingRecords.map((record) => record.serial_number.trim().toLowerCase()));
    } catch (error) {
      setImportFailures([{ message: `Unable to check for existing records: ${getErrorMessage(error, 'Please retry the import.')}` }]);
      setIsImporting(false);
      return;
    }

    for (const [index, record] of entries.entries()) {
      if (existingSerialNumbers.has(record.entry.serial_number.trim().toLowerCase())) {
        skipped.push({ row: record.row, message: 'Serial number already exists; row was skipped.' });
        setProgress(index + 1);
        setSkippedRows([...skipped]);
        continue;
      }

      try {
        await createProductEntry(record.entry);
        successfulImports += 1;
        existingSerialNumbers.add(record.entry.serial_number.trim().toLowerCase());
      } catch (error) {
        failures.push({ row: record.row, message: getErrorMessage(error) });
      }
      setProgress(index + 1);
      setImportedCount(successfulImports);
      setImportFailures([...failures]);
      setSkippedRows([...skipped]);
    }

    if (successfulImports > 0) onImported();
    setIsImporting(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Import from CSV</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Import product, warranty, and installation records in bulk, or export existing records with their database IDs.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleExport} isLoading={isExporting} disabled={isExporting}>
            Download records CSV
          </Button>
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-label="Choose a CSV file to import"
            onChange={handleFileSelection}
          />
        </div>
      </div>

      {exportError && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          Failed to export records: {exportError}
        </p>
      )}

      {fileError && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {fileError}
        </p>
      )}

      {entries && (
        <div className="mt-5 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {isImporting
                ? `Processing row ${progress} of ${entries.length}...`
              : importedCount === null
                ? `${entries.length} valid ${entries.length === 1 ? 'record' : 'records'} ready to import.`
                  : `Imported ${importedCount}; skipped ${skippedRows.length} existing ${skippedRows.length === 1 ? 'record' : 'records'}; ${importFailures.length} failed.`}
            {fileIssues.length > 0 && ` ${fileIssues.length} invalid ${fileIssues.length === 1 ? 'row was' : 'rows were'} skipped.`}
          </p>

          {fileIssues.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              {fileIssues.map((issue) => (
                <li key={`${issue.row}-${issue.message}`}>Row {issue.row}: {issue.message}</li>
              ))}
            </ul>
          )}

          {importFailures.length > 0 && (
            <ul role="alert" className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
              {importFailures.map((failure) => (
                <li key={`${failure.row ?? 'import'}-${failure.message}`}>
                  {failure.row ? `Row ${failure.row}: ` : ''}{failure.message}
                </li>
              ))}
            </ul>
          )}

          {skippedRows.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {skippedRows.map((row) => (
                <li key={`${row.row}-${row.message}`}>Row {row.row}: {row.message}</li>
              ))}
            </ul>
          )}

          {importedCount !== null && importFailures.length === 0 && !isImporting && (
            <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Import finished. {importedCount} new {importedCount === 1 ? 'record was' : 'records were'} imported
              {skippedRows.length > 0 ? `; ${skippedRows.length} existing ${skippedRows.length === 1 ? 'record was' : 'records were'} skipped` : ''}.
            </p>
          )}

          {importedCount === null && entries.length > 0 && (
            <Button type="button" onClick={handleImport} isLoading={isImporting} disabled={isImporting}>
              Import {entries.length} {entries.length === 1 ? 'record' : 'records'}
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
