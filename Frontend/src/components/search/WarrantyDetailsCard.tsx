import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import type { WarrantySearchResult } from '../../types';

const FIELDS: Array<{ label: string; render: (data: WarrantySearchResult) => React.ReactNode }> = [
  { label: 'Product Model', render: (d) => (
    <>
      <span className="block font-semibold text-slate-800 dark:text-slate-200">{d.model_name}</span>
      <span className="block text-xs text-slate-500">{d.part_number}</span>
    </>
  ) },
  { label: 'Branch', render: (d) => <span className="font-semibold text-slate-800 dark:text-slate-200">{d.branch_name}</span> },
  { label: 'Days Remaining', render: (d) => (
    <span className="font-semibold text-blue-600 dark:text-blue-400">{d.days_remaining} days</span>
  ) },
  { label: 'Warranty Period', render: (d) => (
    <span className="font-medium text-slate-700 dark:text-slate-300">
      {formatDate(d.warranty_start_date)} &ndash; {formatDate(d.warranty_end_date)}
    </span>
  ) },
  { label: 'Customer Name', render: (d) => <span className="font-medium text-slate-700 dark:text-slate-300">{d.customer_name}</span> },
  { label: 'Contact / Mobile', render: (d) => (
    <span className="font-medium text-slate-700 dark:text-slate-300">
      {d.contact_person || 'N/A'} &middot; {d.customer_mobile || 'N/A'}
    </span>
  ) },
];

export const WarrantyDetailsCard: React.FC<{ data: WarrantySearchResult }> = ({ data }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Identity strip */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="min-w-0">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Serial Number</span>
          <h3 className="truncate font-mono text-lg font-bold text-slate-900 dark:text-white">{data.serial_number}</h3>
          <p className="mt-0.5 text-xs text-slate-500">Label ID: {data.label_id || 'N/A'}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Detail grid */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 px-5 py-5 md:grid-cols-3">
        {FIELDS.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{field.label}</dt>
            <dd className="mt-1 text-sm break-words">{field.render(data)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
