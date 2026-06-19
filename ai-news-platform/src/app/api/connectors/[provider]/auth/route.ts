import { NextRequest, NextResponse } from 'next/server';
import { getConnectorConfig } from '@/lib/connectors/registry';
import { randomBytes } from 'crypto';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const config = getConnectorConfig(provider);

  if (!config) {
    return NextResponse.json({ error: 'Unknown connector' }, { status: 400 });
  }
  if (config.comingSoon) {
    return NextResponse.json({ error: 'This connector is coming soon' }, { status: 400 });
  }
  if (!config.oauth) {
    return NextResponse.json({ error: 'This connector does not support OAuth' }, { status: 400 });
  }

  // Require Firebase ID token passed as query param (set by frontend before redirect)
  const idToken = request.nextUrl.searchParams.get('id_token');
  if (!idToken) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const state = randomBytes(32).toString('hex');
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connectors/${provider}/callback`;

  const clientId = process.env[config.oauth.clientIdEnv];
  if (!clientId) {
    return NextResponse.json({ error: 'Connector not configured — missing OAuth credentials' }, { status: 500 });
  }

  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.oauth.scopes.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `${config.oauth.authUrl}?${authParams.toString()}`;

  // Store state + ID token in cookies for CSRF protection & auth on callback
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    sameSite: 'lax',
  });
  response.cookies.set('oauth_id_token', idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    sameSite: 'lax',
  });

  return response;
}
