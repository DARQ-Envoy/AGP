import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DonorDataResponse } from './donorData.interface';

@Injectable()
export class DonorDataService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_KEY as string,
    );
  }

  async getDonorData(userId: string): Promise<DonorDataResponse> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('donor_data, donor_data_uploaded_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch donor data: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException('Profile not found');
    }

    return data;
  }

  async clearDonorData(userId: string): Promise<{ cleared: boolean }> {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        donor_data: null,
        donor_data_uploaded_at: null,
      })
      .eq('id', userId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to clear donor data: ${error.message}`,
      );
    }

    return { cleared: true };
  }
}