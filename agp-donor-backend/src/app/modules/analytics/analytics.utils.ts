import { DonorRecord } from '../donorData/donorData.interface';
import {
  KPIs,
  GiftOverTime,
  BreakdownItem,
  BreakdownResult,
} from './analytics.interface';

// ── KPIs ──────────────────────────────────────────────────────────────────

export function computeKPIs(records: DonorRecord[]): KPIs {
  if (!records || records.length === 0) {
    return {
      totalRaised: 0,
      averageGift: 0,
      donorCount: 0,
      retentionRate: 0,
    };
  }

  // Total raised
  const totalRaised = records.reduce((sum, r) => sum + r.gift_amount, 0);

  // Average gift
  const averageGift = totalRaised / records.length;

  // Unique donor count
  const uniqueDonors = new Set(records.map((r) => r.donor_id));
  const donorCount = uniqueDonors.size;

  // Retention rate:
  // A donor is "retained" if they appear in more than one distinct month
  // retentionRate = donors with 2+ distinct gift months / total unique donors
  const donorMonths: Record<string, Set<string>> = {};

  records.forEach((r) => {
    const month = r.gift_date.slice(0, 7); // "2024-03"
    if (!donorMonths[r.donor_id]) {
      donorMonths[r.donor_id] = new Set();
    }
    donorMonths[r.donor_id].add(month);
  });

  const retainedDonors = Object.values(donorMonths).filter(
    (months) => months.size > 1,
  ).length;

  const retentionRate =
    donorCount > 0
      ? parseFloat(((retainedDonors / donorCount) * 100).toFixed(2))
      : 0;

  return {
    totalRaised: parseFloat(totalRaised.toFixed(2)),
    averageGift: parseFloat(averageGift.toFixed(2)),
    donorCount,
    retentionRate,
  };
}

// ── Gifts Over Time ───────────────────────────────────────────────────────

export function computeGiftsOverTime(records: DonorRecord[]): GiftOverTime[] {
  if (!records || records.length === 0) return [];

  // Group by month
  const monthMap: Record<string, number> = {};

  records.forEach((r) => {
    const month = r.gift_date.slice(0, 7); // "2024-03"
    monthMap[month] = (monthMap[month] || 0) + r.gift_amount;
  });

  // Sort chronologically and return
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }));
}

// ── Breakdown (reusable for segment, campaign, channel, region) ───────────

function groupBy(
  records: DonorRecord[],
  key: keyof DonorRecord,
): BreakdownItem[] {
  const map: Record<string, { total: number; count: number }> = {};

  records.forEach((r) => {
    const label = String(r[key]);
    if (!map[label]) {
      map[label] = { total: 0, count: 0 };
    }
    map[label].total += r.gift_amount;
    map[label].count += 1;
  });

  return Object.entries(map)
    .map(([label, { total, count }]) => ({
      label,
      total: parseFloat(total.toFixed(2)),
      count,
      average: parseFloat((total / count).toFixed(2)),
    }))
    .sort((a, b) => b.total - a.total); // highest total first
}

export function computeBreakdown(records: DonorRecord[]): BreakdownResult {
  if (!records || records.length === 0) {
    return {
      bySegment: [],
      byCampaign: [],
      byChannel: [],
      byRegion: [],
    };
  }

  return {
    bySegment: groupBy(records, 'segment'),
    byCampaign: groupBy(records, 'campaign'),
    byChannel: groupBy(records, 'channel'),
    byRegion: groupBy(records, 'region'),
  };
}