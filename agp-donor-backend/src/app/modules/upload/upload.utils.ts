import { parse } from 'csv-parse/sync';
import { DonorRow, InvalidRow, ParseResult } from './upload.interface';

const REQUIRED_COLUMNS = [
  'donor_id',
  'donor_name',
  'segment',
  'gift_date',
  'gift_amount',
  'campaign',
  'channel',
  'region',
];

function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value.trim() !== '';
}

function isValidAmount(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

function hasMissingFields(row: Record<string, any>): string[] {
  return REQUIRED_COLUMNS.filter(
    (col) => row[col] === undefined || row[col] === null || row[col] === '',
  ).map((col) => `Missing field: ${col}`);
}

export function parseCSV(buffer: Buffer): ParseResult {
  // Parse CSV buffer into raw records
  const records: Record<string, any>[] = parse(buffer, {
    columns: true,         // use first row as column headers
    skip_empty_lines: true,
    trim: true,
  });

  const validRows: DonorRow[] = [];
  const invalidRows: InvalidRow[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2; // +2 accounts for header row + 0 index
    const reasons: string[] = [];

    // 1. Check missing fields
    const missingFields = hasMissingFields(record);
    reasons.push(...missingFields);

    // 2. Validate gift_date (only if field exists)
    if (record.gift_date && !isValidDate(record.gift_date)) {
      reasons.push(`Invalid date format: "${record.gift_date}"`);
    }

    // 3. Validate gift_amount (only if field exists)
    if (record.gift_amount && !isValidAmount(record.gift_amount)) {
      reasons.push(`Non-numeric gift amount: "${record.gift_amount}"`);
    }

    if (reasons.length > 0) {
      // Row has issues — push to invalid
      invalidRows.push({
        row: rowNumber,
        data: record,
        reasons,
      });
    } else {
      // Row is clean — push to valid
      validRows.push({
        donor_id: record.donor_id,
        donor_name: record.donor_name,
        segment: record.segment,
        gift_date: record.gift_date,
        gift_amount: parseFloat(record.gift_amount),
        campaign: record.campaign,
        channel: record.channel,
        region: record.region,
      });
    }
  });

  return {
    validRows,
    invalidRows,
    summary: {
      total: records.length,
      valid: validRows.length,
      invalid: invalidRows.length,
    },
  };
}