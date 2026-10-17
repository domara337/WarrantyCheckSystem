import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { searchWarranty } from '../../api/warranty';
import type { WarrantySearchResult } from '../../types';
import { SearchResultsModal } from '../search/SearchResultsModal';
import { queryKeys } from '../../api/queryKeys';

export const TopSearchBar: React.FC = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WarrantySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search field, Escape clears it.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setIsModalOpen(true);

    try {
      const data = await queryClient.fetchQuery({
        queryKey: queryKeys.warrantySearch(query),
        queryFn: () => searchWarranty(query),
      });
      setResults(data);
    } catch (err) {
      console.error('Search failed', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-50 w-full max-w-2xl">
      <form onSubmit={handleSearch} role="search" className="w-full">
        <label htmlFor="global-warranty-search" className="sr-only">
          Search warranties by serial number, label ID, customer, or contact name
        </label>

        <div className="relative flex items-center">
          <svg
            className="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            id="global-warranty-search"
            ref={inputRef}
            type="search"
            placeholder="Search serial number, label ID, customer, or contact name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pr-24 pl-10 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none [&::-webkit-search-cancel-button]:hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-blue-500 dark:focus:bg-slate-800"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-[5.25rem] inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 inline-flex h-8 items-center rounded-full bg-blue-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        results={results}
        isLoading={isLoading}
      />
    </div>
  );
};