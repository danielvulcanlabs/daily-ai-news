import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
    );
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback for development without credentials
  console.warn('FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY not set — admin SDK running without credentials');
  return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project' });
}

try {
  adminApp = getAdminApp();
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
} catch (error) {
  console.warn('Firebase Admin init failed:', error);
  // These will throw if actually used, but allows the app to boot
  adminApp = null as any;
  adminAuth = null as any;
  adminDb = null as any;
}

export { adminApp, adminAuth, adminDb };
