export interface KPIs {
  totalRaised: number;
  averageGift: number;
  donorCount: number;
  retentionRate: number; // percentage 0-100
}

export interface GiftOverTime {
  month: string; // e.g "2024-03"
  total: number;
}

export interface BreakdownItem {
  label: string;
  total: number;
  count: number;
  average: number;
}

export interface BreakdownResult {
  bySegment: BreakdownItem[];
  byCampaign: BreakdownItem[];
  byChannel: BreakdownItem[];
  byRegion: BreakdownItem[];
}