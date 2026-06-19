import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-cron-secret');
  return secret === process.env.CRON_SECRET;
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get all active users
    const usersSnap = await adminDb.collection('users').get();
    const results: { uid: string; status: string; stories?: number }[] = [];

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      try {
        // 2. Get user's connected connectors
        const connectorsSnap = await adminDb
          .collection('users')
          .doc(uid)
          .collection('connectors')
          .where('status', '==', 'connected')
          .get();

        if (connectorsSnap.empty) {
          results.push({ uid, status: 'skipped_no_connectors' });
          continue;
        }

        // 3. Get user's active topics
        const topicsSnap = await adminDb
          .collection('users')
          .doc(uid)
          .collection('topics')
          .where('isActive', '==', true)
          .get();

        if (topicsSnap.empty) {
          results.push({ uid, status: 'skipped_no_topics' });
          continue;
        }

        // 4. Determine time window
        const now = new Date();
        const isMonday = now.getDay() === 1;
        const lookbackHours = isMonday ? 48 : 24;
        const since = new Date(now.getTime() - lookbackHours * 60 * 60 * 1000);

        // 5. Fetch updates from each connector
        // TODO: Implement actual connector fetching
        // For each connector → fetchUpdates(decryptedToken, since)
        // Match against topics → compute relevance scores
        // Store in topics/{topicId}/updates/

        // 6. Generate digest
        const dateStr = now.toISOString().split('T')[0];

        // Get latest issue number
        const digestsSnap = await adminDb
          .collection('users')
          .doc(uid)
          .collection('digests')
          .orderBy('issueNumber', 'desc')
          .limit(1)
          .get();

        const lastIssue = digestsSnap.empty ? 0 : digestsSnap.docs[0].data().issueNumber;

        await adminDb
          .collection('users')
          .doc(uid)
          .collection('digests')
          .doc(dateStr)
          .set({
            issueNumber: lastIssue + 1,
            generatedAt: new Date(),
            updatedAt: new Date(),
            status: 'ready',
            stories: [], // TODO: populated by digest generator
            repos: [],
            stats: {
              totalStories: 0,
              sourcesQueried: connectorsSnap.size,
              topicsMatched: topicsSnap.size,
            },
            signalSources: connectorsSnap.docs.map((d) => d.data().provider),
          });

        results.push({ uid, status: 'generated', stories: 0 });
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
