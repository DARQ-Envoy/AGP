// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
  );

  async register(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({ email, password });

    if (error) throw new UnauthorizedException(error.message);

    return data.user;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException(error.message);

    // Return tokens — controller will set them as cookies
    return {
      user: data.user,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async loginWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw new UnauthorizedException(error.message);

    return data.url; // redirect URL — send to frontend
  }

  async verifyToken(token: string) {
    // This is what your guard calls on every protected request
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) throw new UnauthorizedException('Invalid session');

    return data.user;
  }

  async refreshToken(refreshToken: string) {
  const { data, error } = await this.supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw new UnauthorizedException('Refresh token invalid or expired');
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

  async logout(accessToken: string) {
    await this.supabase.auth.admin.signOut(accessToken);
  }
}