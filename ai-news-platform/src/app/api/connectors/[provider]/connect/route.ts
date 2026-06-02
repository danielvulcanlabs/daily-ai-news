import { NextRequest, NextResponse } from 'next/server';
import { getConnectorConfig } from '@/lib/connectors/registry';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// Helper: extract uid from Authorization header (Firebase ID token)
async function getUidFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const idToken = authHeader.slice(7);
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

// DELETE /api/connectors/[provider]/connect — disconnect a connector
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const config = getConnectorConfig(provider);
  if (!config) {
    return NextResponse.json({ error: 'Unknown connector' }, { status: 400 });
  }

  const uid = await getUidFromRequest(request);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await adminDb
    .collection('users')
    .doc(uid)
    .collection('connectors')
    .doc(provider)
    .delete();

  return NextResponse.json({ success: true, provider, status: 'disconnected' });
}
