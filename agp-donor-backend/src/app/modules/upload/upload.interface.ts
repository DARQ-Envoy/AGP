export interface DonorRow {
  donor_id: string;
  donor_name: string;
  segment: string;
  gift_date: string;
  gift_amount: number;
  campaign: string;
  channel: string;
  region: string;
  user_id?: string;
}

export interface InvalidRow {
  row: number;
  data: Record<string, any>;
  reasons: string[];
}

export interface ParseResult {
  validRows: DonorRow[];
  invalidRows: InvalidRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface CommitPayload {
  validRows: DonorRow[];
}