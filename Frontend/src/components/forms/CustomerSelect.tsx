import React, { useEffect, useState } from 'react';
import type { Customer } from '../../types';
import { getCustomers, createCustomer } from '../../api/masterData';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

interface CustomerSelectProps {
  value: number | string;
  onChange: (id: string | number) => void;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({ value, onChange }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreate = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) return alert('Customer / Company Name is required');
    if (!city.trim()) return alert('City is required');
    if (!address.trim()) return alert('Address is required');
    if (!contactPerson.trim()) return alert('Contact Person is required');
    if (!mobile.trim()) return alert('Mobile Phone is required');

    setLoading(true);

    try {
      // The createCustomer API expects the field to be named 'full_name'.
      const newCust = await createCustomer({
        full_name: name,
        mobile,
        city,
        address,
        contact_person: contactPerson,
        email: email || undefined,
      });

      setCustomers((prev) => [...prev, newCust]);
      onChange(newCust.id);
      setShowModal(false);

      // Clear input fields
      setName('');
      setMobile('');
      setCity('');
      setAddress('');
      setContactPerson('');
      setEmail('');
    } catch (err) {
      console.error('Failed to create customer:', err);
      alert('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customer</label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1 rounded text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Customer
        </button>
      </div>

      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select Customer...</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.mobile ? `(${c.mobile})` : ''}
          </option>
        ))}
      </Select>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-customer-title"
            className="w-full max-w-sm max-h-[80vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 flex flex-col"
          >
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800 flex-shrink-0">
              <h3 id="add-customer-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                Add New Customer
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">Creates a customer record instantly.</p>
            </div>

            {/* Changed from <form> to <div> to prevent nested form submissions */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-2 px-4 py-3 overflow-y-auto flex-1 min-h-0">
                <Input
                  label="Customer / Company Name"
                  placeholder="e.g., Acme Retail Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="City"
                    placeholder="e.g., New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="Mobile Phone"
                    placeholder="e.g., +1-555-0123"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Address"
                  placeholder="e.g., 123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Contact Person"
                    placeholder="e.g., John Doe"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    placeholder="Optional"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40 flex-shrink-0">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Customer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};