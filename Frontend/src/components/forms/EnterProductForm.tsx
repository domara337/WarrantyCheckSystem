import React, { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { Branch, Brand, Product, WarrantySearchResult } from '../../types';
import { createProductEntry, searchWarranty } from '../../api/warranty';
import { getBranches, getBrands, getProductsByBrand } from '../../api/masterData';
import { CustomerSelect } from './CustomerSelect';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

// Add the application's fixed Version and Size options here.
const VERSION_OPTIONS: string[] = ['v1', 'v2', 'v3', 'v4', 'v5'];
const SIZE_OPTIONS: string[] = ['55', '65', '75', '86'];

interface EnterProductFormProps {
  onSuccess: () => void;
}

export const EnterProductForm: React.FC<EnterProductFormProps> = ({ onSuccess }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brandId, setBrandId] = useState<string | number | ''>('');
  const [productId, setProductId] = useState<string | number | ''>('');
  const [branchId, setBranchId] = useState<string | number | ''>('');
  const [customerId, setCustomerId] = useState<string | number>('');

  const [serialNumber, setSerialNumber] = useState('');
  const [labelId, setLabelId] = useState('');
  const [version, setVersion] = useState('');
  const [size, setSize] = useState('');
  const [installationDate, setInstallationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [warrantyStartDate, setWarrantyStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  // Default to the requested three-year term; selecting Custom enables a month entry.
  const [warrantyMonths, setWarrantyMonths] = useState('36');
  const [notes, setNotes] = useState('');

  const [matchedItem, setMatchedItem] = useState<WarrantySearchResult | null>(null);
  const [lookupMessage, setLookupMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reuse the existing master-data sources for the fixed brand/branch choices.
  useEffect(() => {
    let active = true;

    Promise.all([getBranches(), getBrands()])
      .then(([branchData, brandData]) => {
        if (!active) return;
        setBranches(branchData);
        setBrands(brandData);
      })
      .catch((error: unknown) => {
        console.error('Failed to load entry form options:', error);
        if (active) alert('Failed to load brands and branches. Please refresh and try again.');
      });

    return () => {
      active = false;
    };
  }, []);

  // Brand changes clear the prior product and request only products for the new brand.
  useEffect(() => {
    if (!brandId) return;

    let active = true;
    getProductsByBrand(brandId)
      .then((brandProducts) => {
        if (active) setProducts(brandProducts);
      })
      .catch((error: unknown) => {
        console.error('Failed to load products for selected brand:', error);
        if (active) alert('Failed to load products for the selected brand.');
      });

    return () => {
      active = false;
    };
  }, [brandId]);

  // Preserve the existing warranty search API while looking up serials as they are entered.
  useEffect(() => {
    const serial = serialNumber.trim();
    if (!serial) return;

    let active = true;
    const timeoutId = window.setTimeout(() => {
      searchWarranty(serial)
        .then((results) => {
          if (!active) return;
          const match = results.find((item) => item.serial_number.toLowerCase() === serial.toLowerCase());
          setMatchedItem(match ?? null);
          setLookupMessage(match ? '' : 'No existing unit found. You can enter it as a new product.');
        })
        .catch((error: unknown) => {
          console.error('Serial lookup failed:', error);
          if (active) setLookupMessage('Serial lookup failed. Check your connection and try again.');
        })
        .finally(() => {
          if (active) setIsSearching(false);
        });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [serialNumber]);


  // Handle the form submission by validating inputs and calling the API to create the product entry.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   
   // Validate required fields and ensure warranty months is a positive integer.
    if (!brandId || !productId || !branchId || !customerId) {
      alert('Please select a brand, product, branch, and customer.');
      return;
    }

    // Validate warranty months input
    const parsedWarrantyMonths = Number(warrantyMonths);
    if (!Number.isInteger(parsedWarrantyMonths) || parsedWarrantyMonths < 1) {
      alert('Warranty months must be a positive whole number.');
      return;
    }

    setLoading(true);
    try {
      await createProductEntry({
        serial_number: serialNumber.trim(),
        label_id: labelId.trim(),
        brand_id: brandId,
        product_id: productId,
        branch_id: branchId,
        customer_id: customerId,
        version: version || undefined,
        size: size || undefined,
        installation_date: installationDate,
        warranty_months: parsedWarrantyMonths,
        warranty_start_date: warrantyStartDate,
        notes: notes.trim(),
      });
      onSuccess();
    } catch (error) {
      const responseMessage = isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined;
      const message = responseMessage || 'Failed to save product, warranty, and installation.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Enter Product</h2>
        <p className="mt-0.5 text-sm text-slate-500">Save the product, installation, and warranty in one step.</p>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Unit Identity</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Serial Number"
              value={serialNumber}
              onChange={(event) => {
                const value = event.target.value;
                setSerialNumber(value);
                setMatchedItem(null);
                setLookupMessage('');
                setIsSearching(Boolean(value.trim()));
              }}
              placeholder="Enter serial number"
              required
            />
            <Input
              label="Lookup Target Unit"
              value={isSearching ? 'Looking up serial number...' : matchedItem?.model_name ?? ''}
              placeholder={lookupMessage || 'Unit name will appear when matched'}
              readOnly
              aria-live="polite"
            />
            <Input
              label="Label ID"
              value={labelId}
              onChange={(event) => setLabelId(event.target.value)}
              placeholder="Enter label ID"
              required
            />
            <Select
              label="Brand"
              value={brandId}
              onChange={(event) => {
                setBrandId(event.target.value);
                setProductId('');
                setProducts([]);
              }}
              required
            >
              <option value="">Select Brand...</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </Select>
          </div>
          {matchedItem && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              Matched existing unit: {matchedItem.model_name}
            </p>
          )}
          {!matchedItem && lookupMessage && !isSearching && (
            <p className="text-sm text-slate-500" role="status">{lookupMessage}</p>
          )}
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <legend className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Assignment</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              disabled={!brandId}
              required
            >
              <option value="">{brandId ? 'Select Product...' : 'Select a brand first...'}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.model_name} ({product.part_number})
                </option>
              ))}
            </Select>
            <Select
              label="Branch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              required
            >
              <option value="">Select Branch...</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </Select>
          </div>
          <CustomerSelect value={customerId} onChange={setCustomerId} />
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <legend className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Installation</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Version" value={version} onChange={(event) => setVersion(event.target.value)}>
              <option value="">No version selected</option>
              {VERSION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </Select>
            <Select label="Size" value={size} onChange={(event) => setSize(event.target.value)}>
              <option value="">No size selected</option>
              {SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </Select>
            <Input
              label="Installation Date"
              type="date"
              value={installationDate}
              onChange={(event) => setInstallationDate(event.target.value)}
              required
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <legend className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Warranty</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Warranty Start Date"
              type="date"
              value={warrantyStartDate}
              onChange={(event) => setWarrantyStartDate(event.target.value)}
              required
            />
            <div className="flex w-full flex-col gap-1.5">
              <Select
                label="Warranty Duration"
                value={['12', '24', '36', '48', '60'].includes(warrantyMonths) ? warrantyMonths : 'custom'}
                onChange={(event) => {
                  if (event.target.value !== 'custom') setWarrantyMonths(event.target.value);
                  else if (['12', '24', '36', '48', '60'].includes(warrantyMonths)) setWarrantyMonths('');
                }}
                required
              >
                <option value="12">1 year (12 months)</option>
                <option value="24">2 years (24 months)</option>
                <option value="36">3 years (36 months)</option>
                <option value="48">4 years (48 months)</option>
                <option value="60">5 years (60 months)</option>
                <option value="custom">Custom amount</option>
              </Select>
              {!['12', '24', '36', '48', '60'].includes(warrantyMonths) && (
                <Input
                  label="Custom Warranty Months"
                  type="number"
                  min={1}
                  step={1}
                  value={warrantyMonths}
                  onChange={(event) => setWarrantyMonths(event.target.value)}
                  placeholder="Enter number of months"
                  required
                />
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <legend className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Notes</legend>
          <textarea
            id="enter-product-notes"
            aria-label="Notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Installation details or other notes..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-blue-500"
          />
        </fieldset>
      </div>

      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-800/40">
        <Button type="submit" isLoading={loading} disabled={loading}>
          Save Product
        </Button>
      </div>
    </form>
  );
};
