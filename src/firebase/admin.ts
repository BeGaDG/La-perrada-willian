import * as admin from 'firebase-admin';

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once.
 */
export function getAdminFirestore() {
  // Check if the default app is already initialized.
  if (!admin.apps.length) {
    try {
      // These variables are automatically set by Firebase App Hosting.
      // Calling initializeApp() without arguments uses these variables.
      admin.initializeApp();
    } catch (e) {
      // This catch block is important for local development or environments
      // where server-side environment variables might not be set.
      console.error('Admin SDK initialization failed:', e);
      // Depending on the use-case, you might want to re-throw the error
      // or handle it differently. For now, we log it.
    }
  }
  // Return the initialized Firestore instance.
  return admin.firestore();
}
