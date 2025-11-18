import * as admin from 'firebase-admin';

// This is the only place where we need to check for existing initialization.
// The default app is a singleton.
if (!admin.apps.length) {
  try {
    // These variables are automatically set by Firebase App Hosting.
    admin.initializeApp();
  } catch (e) {
    console.error('Admin SDK initialization failed:', e);
  }
}

const firestore = admin.firestore();

/**
 * Returns a ready-to-use instance of the Admin Firestore SDK.
 */
export function getAdminFirestore() {
  return firestore;
}
