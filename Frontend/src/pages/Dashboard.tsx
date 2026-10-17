import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { EnterProductForm } from '../components/forms/EnterProductForm';

export const Dashboard: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Operational Panel</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter product, installation, and warranty details together, or run a serial lookup from the search bar.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Workflow</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">Enter Product</p>
          </div>
        </div>

        <EnterProductForm onSuccess={() => alert('Product, warranty, and installation saved successfully!')} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;