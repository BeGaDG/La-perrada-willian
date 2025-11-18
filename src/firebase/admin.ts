import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once.
 */
export function getAdminFirestore() {
  if (!admin.apps.length) {
    try {
      // Intenta inicializar con credenciales de entorno (para producción en App Hosting)
      admin.initializeApp();
    } catch (e) {
      // Si falla (común en desarrollo local), usa la configuración del cliente como fallback.
      // Esto no es ideal para producción, pero asegura que el desarrollo no se bloquee.
      console.warn("Firebase Admin SDK auto-initialization failed. Falling back to client-side config. Ensure service account credentials are set in production.", e);
      admin.initializeApp({
        credential: admin.credential.cert({
            projectId: firebaseConfig.projectId,
            clientEmail: `firebase-adminsdk-adminsdk@${firebaseConfig.projectId}.iam.gserviceaccount.com`,
            privateKey: process.env.FIREBASE_PRIVATE_KEY || "",
        }),
      });
    }
  }
  // Return the initialized Firestore instance from the default app.
  return admin.firestore();
}
