import { Injectable, BadRequestException } from '@nestjs/common';
import { DonorDataService } from '../donorData/donorData.service';
import { computeKPIs, computeGiftsOverTime, computeBreakdown } from './analytics.utils';
import { KPIs, GiftOverTime, BreakdownResult } from './analytics.interface';

@Injectable()
export class AnalyticsService {
  constructor(private readonly donorDataService: DonorDataService) {}

  // ── Shared: fetch and validate donor data for user ───────────────────────
  private async getRecords(userId: string) {
    const { donor_data } = await this.donorDataService.getDonorData(userId);

    if (!donor_data || donor_data.length === 0) {
      throw new BadRequestException(
        'No donor data found. Please upload a CSV first.',
      );
    }

    return donor_data;
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────
  async getKPIs(userId: string): Promise<KPIs> {
    const records = await this.getRecords(userId);
    return computeKPIs(records);
  }

  // ── Gifts Over Time ───────────────────────────────────────────────────────
  async getGiftsOverTime(userId: string): Promise<GiftOverTime[]> {
    const records = await this.getRecords(userId);
    return computeGiftsOverTime(records);
  }

  // ── Breakdown ─────────────────────────────────────────────────────────────
  async getBreakdown(userId: string): Promise<BreakdownResult> {
    const records = await this.getRecords(userId);
    return computeBreakdown(records);
  }
}