import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { WarrantySearchResult } from '../../types';
import { WarrantyDetailsCard } from './WarrantyDetailsCard';
import { InstallationHistoryCard } from './InstallationHistoryCard';
import { Button } from '../common/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: WarrantySearchResult[];
  isLoading: boolean;
}

export const SearchResultsModal: React.FC<ModalProps> = ({ isOpen, onClose, results, isLoading }) => {
  // Lock background scroll and support Escape-to-close while open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-results-title"
        className="my-auto flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0">
            <h2 id="search-results-title" className="text-base font-semibold text-slate-900 dark:text-white">
              Warranty &amp; System Lookup
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {isLoading
                ? 'Searching records...'
                : `${results.length} ${results.length === 1 ? 'match' : 'matches'} returned`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lookup"
            className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="scrollbar-slim flex-1 space-y-4 overflow-y-auto p-5">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Executing database lookup...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <p className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-300">No Record Found</p>
              <p className="mt-1 text-sm text-slate-500">
                Check the serial number, label ID, customer, or contact name and try again.
              </p>
            </div>
          ) : (
            results.map((item) => (
              <div key={item.warranty_id} className="space-y-4">
                <WarrantyDetailsCard data={item} />
                <InstallationHistoryCard installations={item.installations} />
              </div>
            ))
          )}
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};