import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from '../../guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // GET /analytics/kpis
  @Get('kpis')
  @HttpCode(HttpStatus.OK)
  async getKPIs(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user.id;
    const result = await this.analyticsService.getKPIs(userId);

    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'KPIs fetched successfully',
      data: result,
    });
  }

  // GET /analytics/gifts-over-time
  @Get('gifts-over-time')
  @HttpCode(HttpStatus.OK)
  async getGiftsOverTime(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user.id;
    const result = await this.analyticsService.getGiftsOverTime(userId);

    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Gifts over time fetched successfully',
      data: result,
    });
  }

  // GET /analytics/breakdown
  @Get('breakdown')
  @HttpCode(HttpStatus.OK)
  async getBreakdown(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user.id;
    const result = await this.analyticsService.getBreakdown(userId);

    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Breakdown fetched successfully',
      data: result,
    });
  }
}