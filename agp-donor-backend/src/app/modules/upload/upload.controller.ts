import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { JwtGuard } from '../../guards/jwt.guard';
import type { CommitPayload } from './upload.interface';

@UseGuards(JwtGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ── POST /upload/parse ────────────────────────────────────────────────────
  // Accepts CSV file, returns preview of valid + invalid rows
  // Does NOT write to DB
  @Post('parse')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep file in memory — no disk writes
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  async parseCSV(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const result = await this.uploadService.parseCSV(file);

    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'CSV parsed successfully',
      data: result,
    });
  }

  // ── POST /upload/commit ───────────────────────────────────────────────────
  // Receives validRows from frontend after user confirms preview
  // Writes to DB tied to logged-in user
  @Post('commit')
  @HttpCode(HttpStatus.CREATED)
  async commitRows(
    @Body() body: CommitPayload,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req as any).user.id; // set by JwtGuard
    const result = await this.uploadService.commitRows(userId, body);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      statusCode: HttpStatus.CREATED,
      message: `${result.inserted} rows committed successfully`,
      data: result,
    });
  }
}