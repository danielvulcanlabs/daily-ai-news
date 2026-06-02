import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

function verifyCronSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Get all users who have today's digest
    const usersSnap = await adminDb.collection('users').get();
    const results: { uid: string; status: string }[] = [];

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      try {
        // Check if morning digest exists
        const digestRef = adminDb
          .collection('users')
          .doc(uid)
          .collection('digests')
          .doc(dateStr);

        const digestSnap = await digestRef.get();
        if (!digestSnap.exists) {
          results.push({ uid, status: 'skipped_no_morning_digest' });
          continue;
        }

        // Fetch new updates since morning (last 6 hours)
        const since = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        // TODO: Same connector fetching logic as morning
        // Append new stories to existing digest
        // Re-rank all stories

        await digestRef.update({
          updatedAt: new Date(),
          // stories: [...existingStories, ...newStories], // TODO
        });

        results.push({ uid, status: 'updated' });
      } catch (err: any) {
        results.push({ uid, status: `error: ${err.message}` });
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
