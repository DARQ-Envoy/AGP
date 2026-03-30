export interface DonorRecord {
  donor_id: string;
  donor_name: string;
  segment: string;
  gift_date: string;
  gift_amount: number;
  campaign: string;
  channel: string;
  region: string;
}

export interface DonorDataResponse {
  donor_data: DonorRecord[] | null;
  donor_data_uploaded_at: string | null;
}