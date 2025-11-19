'use server';

import * as admin from 'firebase-admin';

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once,
 * relying on Firebase's automatic credential detection in the hosting environment.
 */
export function getAdminFirestore() {
  // Check if the app is already initialized to prevent re-initialization errors.
  if (!admin.apps.length) {
    try {
      // In a hosted Firebase environment (like App Hosting or Cloud Functions),
      // calling initializeApp() without arguments will automatically use the
      // project's default service account credentials.
      admin.initializeApp();
    } catch (e: any) {
      // This catch block is a safeguard. If initialization fails, it will log a
      // descriptive error message, which is crucial for debugging.
      console.error(
        'Firebase Admin SDK initialization failed. This can happen if the environment is not configured with the correct Google Cloud service account credentials. In a local dev environment, you might need to set the GOOGLE_APPLICATION_CREDENTIALS environment variable. In a hosted Firebase environment, this should be automatic.',
        e
      );
      // Re-throwing the error to ensure the calling function knows initialization failed.
      throw new Error('Could not initialize Firebase Admin SDK.');
    }
  }
  // Return the initialized Firestore instance from the default app.
  return admin.firestore();
}
