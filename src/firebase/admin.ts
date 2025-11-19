import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde .env.local
dotenv.config({ path: '.env.local' });

/**
 * Returns a ready-to-use, initialized instance of the Admin Firestore SDK.
 * This function handles lazy initialization to ensure `initializeApp` is called only once.
 */
export function getAdminFirestore() {
  if (!admin.apps.length) {
    // Cuando se ejecuta en el entorno de desarrollo local, las variables de entorno
    // que configuramos en .env.local estarán disponibles gracias a `dotenv`.
    if (process.env.FIREBASE_PRIVATE_KEY) {
      // Formatear la clave privada, reemplazando los escapes de nueva línea.
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } else {
      // Si FIREBASE_PRIVATE_KEY no está definida, se asume que estamos en un
      // entorno de producción (como App Hosting) que provee las credenciales
      // automáticamente. `initializeApp()` sin argumentos las usará.
      try {
        admin.initializeApp();
      } catch (e: any) {
        console.error("Firebase Admin SDK auto-initialization failed. Ensure service account credentials are set in your production environment.", e);
      }
    }
  }
  // Devolver la instancia de Firestore inicializada de la app por defecto.
  return admin.firestore();
}
