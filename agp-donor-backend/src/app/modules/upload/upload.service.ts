import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { parseCSV } from './upload.utils';
import { CommitPayload, DonorRow, ParseResult } from './upload.interface';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_KEY as string, // service key for backend DB operations
    );
  }

  // ── Parse only — no DB write ──────────────────────────────────────────────
  async parseCSV(file: Express.Multer.File): Promise<ParseResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a .csv');
    }

    try {
      const result = parseCSV(file.buffer);
      return result;
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV: ${error.message}`);
    }
  }

// Commit — now just one UPDATE on the user's profile
async commitRows(userId: string, payload: CommitPayload): Promise<{ inserted: number }> {
  const { validRows } = payload;

  if (!validRows || validRows.length === 0) {
    throw new BadRequestException('No valid rows to commit');
  }

  const { error } = await this.supabase
    .from('profiles')
    .update({
      donor_data: validRows,
      donor_data_uploaded_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new InternalServerErrorException(
      `Failed to save donor data: ${error.message}`,
    );
  }

  return { inserted: validRows.length };
}
}
