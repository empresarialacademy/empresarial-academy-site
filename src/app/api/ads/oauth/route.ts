import { NextResponse } from 'next/server';
import { OAUTH_CONFIG } from '@/lib/google-ads';

export async function GET() {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', OAUTH_CONFIG.clientId);
  url.searchParams.append('redirect_uri', OAUTH_CONFIG.redirectUri);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', OAUTH_CONFIG.scope);
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent'); // Força a tela de consentimento para garantir o refresh_token

  return NextResponse.redirect(url.toString());
}
