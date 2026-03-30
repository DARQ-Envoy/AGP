export interface AIQueryRequest {
  question: string;
}

export interface PromptContext {
  totalDonors: number;
  totalRaised: number;
  averageGift: number;
  dateRange: { from: string; to: string };
  segments: string[];
  campaigns: string[];
  channels: string[];
  regions: string[];
  topCampaignByTotal: { name: string; total: number };
  topSegmentByTotal: { name: string; total: number };
  records: Record<string, any>[];
}