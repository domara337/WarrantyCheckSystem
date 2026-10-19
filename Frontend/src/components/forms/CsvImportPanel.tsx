import React, { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { createProductEntry } from '../../api/warranty';
import { Button } from '../common/Button';
import {
  parseProductCsv,
  PRODUCT_CSV_TEMPLATE,
  type CsvImportIssue,
  type ParsedProductCsv,
} from '../../utils/csvImport';

interface CsvImportPanelProps {
  onImported: () => void;
}

interface ImportFailure {
  row: number;
  message: string;
}

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || 'The server rejected this row.';
  }
  return 'An unexpected error prevented this row from being imported.';
};

const downloadTemplate = () => {
  const template = new Blob([PRODUCT_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(template);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'warranty-import-template.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const CsvImportPanel: React.FC<CsvImportPanelProps> = ({ onImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<ParsedProductCsv['entries'] | null>(null);
  const [fileIssues, setFileIssues] = useState<CsvImportIssue[]>([]);
  const [fileError, setFileError] = useState('');
  const [importFailures, setImportFailures] = useState<ImportFailure[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

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
    setImportedCount(0);
    const failures: ImportFailure[] = [];
    let successfulImports = 0;

    for (const [index, record] of entries.entries()) {
      try {
        await createProductEntry(record.entry);
        successfulImports += 1;
      } catch (error) {
        failures.push({ row: record.row, message: getErrorMessage(error) });
      }
      setProgress(index + 1);
      setImportedCount(successfulImports);
      setImportFailures([...failures]);
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
            Import product, warranty, and installation records in bulk. Use the template and provide the existing
            brand, product, branch, and customer IDs.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={downloadTemplate}>
            Download template
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

      {fileError && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {fileError}
        </p>
      )}

      {entries && (
        <div className="mt-5 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {isImporting
              ? `Importing row ${progress} of ${entries.length}...`
              : importedCount === null
                ? `${entries.length} valid ${entries.length === 1 ? 'record' : 'records'} ready to import.`
                : `Imported ${importedCount} of ${entries.length} records.`}
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
                <li key={`${failure.row}-${failure.message}`}>Row {failure.row}: {failure.message}</li>
              ))}
            </ul>
          )}

          {importedCount !== null && importedCount > 0 && importFailures.length === 0 && !isImporting && (
            <p role="status" className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              All valid records were imported successfully.
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
