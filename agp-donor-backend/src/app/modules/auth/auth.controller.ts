// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  UnauthorizedException
} from '@nestjs/common';
import type { Response , Request} from 'express';
import { AuthService } from './auth.service';
import { JwtGuard } from '../../guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: any, @Res() res: Response) {
    const user = await this.authService.register(body.email, body.password);

    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Res() res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );

    // Set HttpOnly cookies here — service never touches res
    this.setCookies(res, accessToken, refreshToken);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  }

  @Get('check')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  check() {
    return { success: true, message: 'Authenticated' };
  }

  @Get('google')
  async googleLogin(@Res() res: Response) {
    const redirectUrl = await this.authService.loginWithGoogle();
    return res.redirect(redirectUrl);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.access_token;
    if (token) await this.authService.logout(token);

    // Clear both cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  }


@Post('refresh-token')
@HttpCode(HttpStatus.OK)
async refreshToken(@Req() req: Request, @Res() res: Response) {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    throw new UnauthorizedException('No refresh token found');
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await this.authService.refreshToken(refreshToken);

  // Set new cookies
  this.setCookies(res, accessToken, newRefreshToken);

  return res.status(HttpStatus.OK).json({
    success: true,
    message: 'Token refreshed',
    data: null,
  });
}






  // Private helper — keeps cookie config in one place
  private setCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production'

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,   // ← was 'strict', lax allows cross-origin sends
    path: '/',
  }
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}