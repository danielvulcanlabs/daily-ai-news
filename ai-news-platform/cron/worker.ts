import cron from 'node-cron';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || '';

async function callCronEndpoint(path: string, label: string) {
  console.log(`[${new Date().toISOString()}] Starting ${label}...`);

  try {
    const response = await fetch(`${APP_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] ${label} completed:`, JSON.stringify(data));
    } else {
      console.error(`[${new Date().toISOString()}] ${label} failed:`, data);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ${label} error:`, err);
  }
}

// ── Morning digest: 6:00 AM daily (Asia/Ho_Chi_Minh) ──
cron.schedule('0 6 * * *', () => {
  callCronEndpoint('/api/cron/morning', 'Morning Digest');
}, {
  timezone: 'Asia/Ho_Chi_Minh',
});

// ── Midday update: 12:00 PM daily (Asia/Ho_Chi_Minh) ──
cron.schedule('0 12 * * *', () => {
  callCronEndpoint('/api/cron/midday', 'Midday Update');
}, {
  timezone: 'Asia/Ho_Chi_Minh',
});

console.log(`[${new Date().toISOString()}] Cron worker started`);
console.log('  → Morning digest: 6:00 AM Asia/Ho_Chi_Minh');
console.log('  → Midday update:  12:00 PM Asia/Ho_Chi_Minh');
console.log(`  → Target: ${APP_URL}`);
