'use server';

import * as admin from 'firebase-admin';

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once.
 * It explicitly constructs credentials from environment variables.
 */
export async function getAdminFirestore() {
  if (!admin.apps.length) {
    try {
      if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Firebase environment variables are not set.');
      }
      
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } catch (e: any) {
      console.error(
        'Firebase Admin SDK initialization failed:',
        e.message
      );
      throw new Error('Could not initialize Firebase Admin SDK. Please check server logs and environment variables.');
    }
  }
  return admin.firestore();
}
