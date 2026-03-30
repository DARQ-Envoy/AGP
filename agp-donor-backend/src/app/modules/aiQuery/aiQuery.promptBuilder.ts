import { DonorRecord } from '../donorData/donorData.interface';
import { PromptContext } from './aiQuery.interface';

// ── Build structured context from raw records ─────────────────────────────
function buildContext(records: DonorRecord[]): PromptContext {
  const totalRaised = records.reduce((sum, r) => sum + r.gift_amount, 0);
  const averageGift = totalRaised / records.length;

  // Unique values
  const segments = [...new Set(records.map((r) => r.segment))];
  const campaigns = [...new Set(records.map((r) => r.campaign))];
  const channels = [...new Set(records.map((r) => r.channel))];
  const regions = [...new Set(records.map((r) => r.region))];

  // Date range
  const dates = records
    .map((r) => new Date(r.gift_date).getTime())
    .sort((a, b) => a - b);

  const dateRange = {
    from: new Date(dates[0]).toISOString().slice(0, 10),
    to: new Date(dates[dates.length - 1]).toISOString().slice(0, 10),
  };

  // Top campaign by total raised
  const campaignTotals: Record<string, number> = {};
  records.forEach((r) => {
    campaignTotals[r.campaign] = (campaignTotals[r.campaign] || 0) + r.gift_amount;
  });
  const topCampaignEntry = Object.entries(campaignTotals).sort(
    ([, a], [, b]) => b - a,
  )[0];

  // Top segment by total raised
  const segmentTotals: Record<string, number> = {};
  records.forEach((r) => {
    segmentTotals[r.segment] = (segmentTotals[r.segment] || 0) + r.gift_amount;
  });
  const topSegmentEntry = Object.entries(segmentTotals).sort(
    ([, a], [, b]) => b - a,
  )[0];

  return {
    totalDonors: new Set(records.map((r) => r.donor_id)).size,
    totalRaised: parseFloat(totalRaised.toFixed(2)),
    averageGift: parseFloat(averageGift.toFixed(2)),
    dateRange,
    segments,
    campaigns,
    channels,
    regions,
    topCampaignByTotal: {
      name: topCampaignEntry[0],
      total: parseFloat(topCampaignEntry[1].toFixed(2)),
    },
    topSegmentByTotal: {
      name: topSegmentEntry[0],
      total: parseFloat(topSegmentEntry[1].toFixed(2)),
    },
    records,
  };
}

// ── Build the full system prompt ──────────────────────────────────────────
export function buildPrompt(records: DonorRecord[], question: string): string {
  const ctx = buildContext(records);

  return `
You are a donor analytics assistant for a nonprofit organization.
You have been given structured donor gift data and must answer the user's question accurately using only this data.
Do not guess, hallucinate, or reference data not present below.
Be concise, clear, and use numbers where relevant.

=== DATASET SUMMARY ===
- Total unique donors: ${ctx.totalDonors}
- Total raised: $${ctx.totalRaised.toLocaleString()}
- Average gift: $${ctx.averageGift.toLocaleString()}
- Date range: ${ctx.dateRange.from} to ${ctx.dateRange.to}
- Segments: ${ctx.segments.join(', ')}
- Campaigns: ${ctx.campaigns.join(', ')}
- Channels: ${ctx.channels.join(', ')}
- Regions: ${ctx.regions.join(', ')}
- Top campaign by total raised: ${ctx.topCampaignByTotal.name} ($${ctx.topCampaignByTotal.total.toLocaleString()})
- Top segment by total raised: ${ctx.topSegmentByTotal.name} ($${ctx.topSegmentByTotal.total.toLocaleString()})

=== RAW RECORDS (JSON) ===
${JSON.stringify(ctx.records)}

=== USER QUESTION ===
${question}
`.trim();
}