import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, hint, className = '', children, ...props }) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <select
          className={`w-full appearance-none rounded-lg border border-slate-300 bg-white py-2 pr-10 pl-3.5 text-sm text-slate-900 transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
            error ? 'border-rose-500' : ''
          } dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-blue-500 ${className}`}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <span className="text-xs font-medium text-rose-500">{error}</span>}
      {!error && hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
  );
};
