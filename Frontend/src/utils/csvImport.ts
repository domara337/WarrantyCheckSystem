import type { ProductEntry } from '../types';

export interface CsvImportIssue {
  row: number;
  message: string;
}

export interface ParsedProductCsv {
  entries: Array<{ row: number; entry: ProductEntry }>;
  issues: CsvImportIssue[];
}

const REQUIRED_COLUMNS = [
  'serial_number',
  'label_id',
  'brand_id',
  'product_id',
  'branch_id',
  'customer_id',
  'warranty_months',
  'warranty_start_date',
  'installation_date',
] as const;

const OPTIONAL_COLUMNS = ['version', 'size', 'notes'] as const;
const VALID_COLUMNS = new Set<string>([...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]);

const parseCsvRows = (input: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let insideQuotes = false;
  let afterQuote = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (insideQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          insideQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (afterQuote && character !== ',' && character !== '\r' && character !== '\n') {
      if (character === ' ' || character === '\t') continue;
      throw new Error('Unexpected character after a quoted CSV field.');
    }

    if (character === '"') {
      if (field.length > 0 || afterQuote) {
        throw new Error('Unexpected quote in an unquoted CSV field.');
      }
      insideQuotes = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
      afterQuote = false;
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      afterQuote = false;
    } else {
      field += character;
    }
  }

  if (insideQuotes) throw new Error('The CSV contains an unclosed quoted field.');
  if (field.length > 0 || row.length > 0 || afterQuote) {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }

  return rows;
};

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const parseProductCsv = (input: string): ParsedProductCsv => {
  const rows = parseCsvRows(input.replace(/^\uFEFF/, ''));
  if (rows.length === 0) throw new Error('The CSV file is empty.');

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const duplicateHeader = headers.find((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeader) throw new Error(`The CSV contains a duplicate "${duplicateHeader}" column.`);

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}.`);
  }

  const unsupportedColumns = headers.filter((header) => !VALID_COLUMNS.has(header));
  if (unsupportedColumns.length > 0) {
    throw new Error(`Unsupported columns: ${unsupportedColumns.join(', ')}.`);
  }

  const entries: ParsedProductCsv['entries'] = [];
  const issues: CsvImportIssue[] = [];
  const serialNumbers = new Set<string>();

  rows.slice(1).forEach((values, index) => {
    const rowNumber = index + 2;
    if (values.length !== headers.length) {
      issues.push({ row: rowNumber, message: `Expected ${headers.length} columns but found ${values.length}.` });
      return;
    }

    const record = Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex].trim()]));
    const emptyFields = REQUIRED_COLUMNS.filter((column) => !record[column]);
    if (emptyFields.length > 0) {
      issues.push({ row: rowNumber, message: `Missing required values: ${emptyFields.join(', ')}.` });
      return;
    }

    const integerFields = ['brand_id', 'branch_id', 'warranty_months'] as const;
    const invalidIntegers = integerFields.filter((column) => !/^\d+$/.test(record[column]) || Number(record[column]) < 1);
    if (invalidIntegers.length > 0) {
      issues.push({ row: rowNumber, message: `Must be positive whole numbers: ${invalidIntegers.join(', ')}.` });
      return;
    }

    const invalidDates = (['warranty_start_date', 'installation_date'] as const)
      .filter((column) => !isValidDate(record[column]));
    if (invalidDates.length > 0) {
      issues.push({ row: rowNumber, message: `Dates must use YYYY-MM-DD and be valid: ${invalidDates.join(', ')}.` });
      return;
    }

    const normalizedSerial = record.serial_number.toLowerCase();
    if (serialNumbers.has(normalizedSerial)) {
      issues.push({ row: rowNumber, message: 'Duplicate serial_number in this file.' });
      return;
    }
    serialNumbers.add(normalizedSerial);

    entries.push({
      row: rowNumber,
      entry: {
        serial_number: record.serial_number,
        label_id: record.label_id,
        brand_id: Number(record.brand_id),
        product_id: record.product_id,
        branch_id: Number(record.branch_id),
        customer_id: record.customer_id,
        warranty_months: Number(record.warranty_months),
        warranty_start_date: record.warranty_start_date,
        installation_date: record.installation_date,
        version: record.version ?? '',
        size: record.size ?? '',
        notes: record.notes ?? '',
      },
    });
  });

  if (entries.length === 0 && issues.length === 0) {
    throw new Error('The CSV has a header row but no data rows.');
  }

  return { entries, issues };
};

export const PRODUCT_CSV_TEMPLATE =
  'serial_number,label_id,brand_id,product_id,branch_id,customer_id,warranty_months,warranty_start_date,installation_date,version,size,notes\r\n' +
  'SN-12345,LABEL-123,1,PRODUCT-ID,1,CUSTOMER-ID,36,2026-10-19,2026-10-19,v1,65,';
