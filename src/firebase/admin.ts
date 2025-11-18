import * as admin from 'firebase-admin';

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once.
 */
export function getAdminFirestore() {
  // Check if the default app is already initialized. If not, initialize it.
  if (!admin.apps.length) {
    // When running in a Firebase or Google Cloud environment, the SDK will
    // automatically detect the service account credentials and project ID.
    admin.initializeApp();
  }
  // Return the initialized Firestore instance from the default app.
  return admin.firestore();
}
