import {
  Controller,
  Get,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DonorDataService } from './donorData.service';
import { JwtGuard } from '../../guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('donor-data')
export class DonorDataController {
  constructor(private readonly donorDataService: DonorDataService) {}

  // GET /donor-data
  @Get()
  @HttpCode(HttpStatus.OK)
  async getDonorData(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user.id;
    const result = await this.donorDataService.getDonorData(userId);

    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Donor data fetched successfully',
      data: result,
    });
  }

  // DELETE /donor-data
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearDonorData(@Req() req: Request, @Res() res: Response) {
    const userId = (req as any).user.id;
    const result = await this.donorDataService.clearDonorData(userId);

    return res.status(HttpStatus.OK).json({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Donor data cleared successfully',
      data: result,
    });
  }
}