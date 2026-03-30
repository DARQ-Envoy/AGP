import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
    private readonly logger = new Logger(JwtGuard.name)
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string,
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    // this.logger.log(`Incoming request to ${request.method} ${request.url}`, request)  // ← use this
    const token = request.cookies?.access_token;
    if (!token){
      throw new UnauthorizedException('No session found');
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach user to request so controllers can read req.user
    (request as any).user = data.user;

    return true;
  }
}