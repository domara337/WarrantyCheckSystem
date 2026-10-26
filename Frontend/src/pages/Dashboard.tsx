import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { CsvImportPanel } from '../components/forms/CsvImportPanel';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../api/queryKeys';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Operational Panel</h1>
          </div>
        </div>

        <CsvImportPanel onImported={() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.warrantyRecords });
          void queryClient.invalidateQueries({ queryKey: ['warranty-search'] });
        }} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;