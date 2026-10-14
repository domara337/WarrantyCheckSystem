import React from 'react';
import { formatDate } from '../../utils/formatters';

interface InstallationProps {
  installations?: Array<{
    id: number | string;
    version: string;
    size: string;
    installation_date: string;
    technician_name?: string;
    notes: string;
  }>;
}

export const InstallationHistoryCard: React.FC<InstallationProps> = ({ installations }) => {
  if (installations !== undefined && !Array.isArray(installations)) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300" role="alert">
        Installation records could not be displayed because the server returned invalid data.
      </p>
    );
  }

  if (!installations || installations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
        <p className="text-sm text-slate-500">No on-site installation records logged for this item yet.</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Installation &amp; Technical Details</h4>
        <p className="mt-0.5 text-xs text-slate-500">
          {installations.length} {installations.length === 1 ? 'record' : 'records'} on file
        </p>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {installations.map((inst, index) => (
          <li key={inst.id || index} className="space-y-2.5 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25a2.25 2.25 0 012.25-2.25h14.5a2.25 2.25 0 012.25 2.25v7.5" />
                </svg>
                {formatDate(inst.installation_date)}
              </span>
              <span className="text-slate-500">Tech: {inst.technician_name || 'Assigned Technician'}</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p className="min-w-0 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Firmware/Version:</span>{' '}
                <span className="break-words">{inst.version}</span>
              </p>
              <p className="min-w-0 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Display/Size:</span>{' '}
                <span className="break-words">{inst.size}</span>
              </p>
            </div>

            {inst.notes && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                <span className="font-semibold">Notes:</span> {inst.notes}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
