import { NextRequest, NextResponse } from 'next/server';
import { getConnectorConfig } from '@/lib/connectors/registry';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { encrypt } from '@/lib/utils/crypto';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { provider } = await context.params;
  const config = getConnectorConfig(provider);

  if (!config || !config.oauth) {
    return NextResponse.redirect(`${appUrl}/connectors?error=invalid_connector`);
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${appUrl}/connectors?error=${error}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/connectors?error=missing_params`);
  }

  // Verify CSRF state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (state !== storedState) {
    return NextResponse.redirect(`${appUrl}/connectors?error=invalid_state`);
  }

  // Get user from ID token stored in cookie during auth initiation
  const idToken = request.cookies.get('oauth_id_token')?.value;
  if (!idToken) {
    return NextResponse.redirect(`${appUrl}/login?error=auth_required`);
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  // Exchange code for tokens
  const redirectUri = `${appUrl}/api/connectors/${provider}/callback`;
  const clientId = process.env[config.oauth.clientIdEnv] || '';
  const clientSecret = process.env[config.oauth.clientSecretEnv] || '';

  const tokenResponse = await fetch(config.oauth.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    const errBody = await tokenResponse.text().catch(() => 'unknown');
    console.error(`[Connector] Token exchange failed for ${provider}:`, errBody);
    return NextResponse.redirect(`${appUrl}/connectors?error=token_exchange_failed`);
  }

  const tokens = await tokenResponse.json();

  // Store encrypted tokens in Firestore
  await adminDb
    .collection('users')
    .doc(uid)
    .collection('connectors')
    .doc(provider)
    .set(
      {
        provider,
        category: config.category,
        status: 'connected',
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token || ''),
        tokenExpiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scopes: config.oauth.scopes,
        metadata: { authType: 'oauth' },
        lastSyncAt: null,
        connectedAt: new Date(),
      },
      { merge: true }
    );

  // Clean up cookies and redirect
  const response = NextResponse.redirect(`${appUrl}/connectors?connected=${provider}`);
  response.cookies.delete('oauth_state');
  response.cookies.delete('oauth_id_token');
  return response;
}
