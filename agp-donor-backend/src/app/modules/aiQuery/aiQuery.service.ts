import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import OpenAI from 'openai';
import { DonorDataService } from '../donorData/donorData.service';
import { buildPrompt } from './aiQuery.promptBuilder';
import Groq from 'groq-sdk';

@Injectable()
export class AIQueryService {
  private groq: Groq;
private readonly logger = new Logger(AIQueryService.name)

  constructor(private readonly donorDataService: DonorDataService) {
    
    // Grok is OpenAI-compatible — swap baseURL only
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  // async streamQuery(
  //   userId: string,
  //   question: string,
  //   res: Response,
  // ): Promise<void> {
  //   // 1. Pull user's donor data
  //   const { donor_data } = await this.donorDataService.getDonorData(userId);

  //   if (!donor_data || donor_data.length === 0) {
  //     throw new BadRequestException(
  //       'No donor data found. Please upload a CSV first.',
  //     );
  //   }

  //   // 2. Build structured prompt — not a raw CSV dump
  //   const prompt = buildPrompt(donor_data, question);

  //   // 3. Set SSE headers before streaming starts
  //   res.setHeader('Content-Type', 'text/event-stream');
  //   res.setHeader('Cache-Control', 'no-cache');
  //   res.setHeader('Connection', 'keep-alive');
  //   res.flushHeaders(); // flush headers immediately so client can start reading

  //   try {
  //     // 4. Stream from Grok
  //     const stream = await this.grok.chat.completions.create({
  //       model: 'grok-3-latest',
  //       stream: true,
  //       messages: [
  //         {
  //           role: 'system',
  //           content:
  //             'You are a nonprofit donor analytics assistant. Answer questions using only the data provided. Be precise and data-driven.',
  //         },
  //         {
  //           role: 'user',
  //           content: prompt,
  //         },
  //       ],
  //     });

  //     // 5. Pipe each chunk to the SSE stream
  //     for await (const chunk of stream) {
  //       const token = chunk.choices[0]?.delta?.content;

  //       if (token) {
  //         // SSE format: each message must be "data: ...\n\n"
  //         res.write(`data: ${JSON.stringify({ token })}\n\n`);
  //       }
  //     }

  //     // 6. Send done signal so frontend knows stream is complete
  //     res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  //     res.end();
  //   } catch (error) {
  //     // Send error through the stream so frontend can handle it
  //     this.logger.error('Error during AI query streaming', error.message);
  //     res.write(
  //       `data: ${JSON.stringify({ error: 'AI query failed', detail: error.message })}\n\n`,
  //     );
  //     res.end();
  //   }
  // }

  async streamQuery(userId: string, question: string, res: Response): Promise<void> {
    const { donor_data } = await this.donorDataService.getDonorData(userId);

    if (!donor_data || donor_data.length === 0) {
      throw new BadRequestException('No donor data found. Please upload a CSV first.');
    }

    const prompt = buildPrompt(donor_data, question);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const stream = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',  // free model on Groq
        stream: true,
        messages: [
          {
            role: 'system',
            content: 'You are a nonprofit donor analytics assistant. Answer questions using only the data provided. Be precise and data-driven.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) {
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      this.logger.error('Error during AI query streaming', error);
      res.write(`data: ${JSON.stringify({ error: 'AI query failed', detail: error.message })}\n\n`);
      res.end();
    }
  }
}