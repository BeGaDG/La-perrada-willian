import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once.
 */
export function getAdminFirestore() {
  if (!admin.apps.length) {
    // Cuando se ejecuta en el entorno de desarrollo local, la variable de entorno
    // FIREBASE_PRIVATE_KEY que configuramos en .env.local estará disponible.
    if (process.env.FIREBASE_PRIVATE_KEY) {
      // Formatear la clave privada, reemplazando los escapes de nueva línea.
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      // Obtener el email del cliente de las variables de entorno o construirlo.
      // El service account email es necesario junto con la clave privada.
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-fbsvc@${firebaseConfig.projectId}.iam.gserviceaccount.com`;

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
    } else {
      // Si FIREBASE_PRIVATE_KEY no está definida, se asume que estamos en un
      // entorno de producción (como App Hosting) que provee las credenciales
      // automáticamente a través de variables de entorno estándar.
      // `initializeApp()` sin argumentos las usará.
      try {
        admin.initializeApp();
      } catch (e: any) {
        console.error("Firebase Admin SDK auto-initialization failed. Ensure service account credentials are set in your production environment or FIREBASE_PRIVATE_KEY is set locally.", e);
      }
    }
  }
  // Devolver la instancia de Firestore inicializada de la app por defecto.
  return admin.firestore();
}
