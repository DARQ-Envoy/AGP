import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AIQueryService } from './aiQuery.service';
import { JwtGuard } from '../../guards/jwt.guard';
import type { AIQueryRequest } from './aiQuery.interface';

@UseGuards(JwtGuard)
@Controller('ai-query')
export class AIQueryController {
  constructor(private readonly aiQueryService: AIQueryService) {}

  // POST /ai-query
  // Returns SSE stream — frontend reads token by token
  @Post()
  async query(
    @Body() body: AIQueryRequest,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!body.question || body.question.trim() === '') {
      throw new BadRequestException('Question cannot be empty');
    }

    const userId = (req as any).user.id;

    // Service owns the SSE stream — controller just hands off res
    await this.aiQueryService.streamQuery(userId, body.question.trim(), res);
  }
}