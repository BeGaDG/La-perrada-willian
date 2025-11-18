'use server'; // Directiva OBLIGATORIA para marcarlo como una Server Action.

import { v2 as cloudinary } from 'cloudinary';

// 1. Configuración del SDK de Cloudinary.
//    Esto se ejecuta en el servidor, por lo que tiene acceso seguro
//    a las variables de entorno secretas.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Siempre usar HTTPS.
});

/**
 * Función asíncrona que maneja la subida de un archivo a Cloudinary.
 * @param fileDataUri - El archivo codificado como un string Data URI (Base64).
 * @param folder - La carpeta de destino dentro de tu cuenta de Cloudinary.
 * @returns Un objeto con el resultado de la subida.
 */
export async function uploadFile(fileDataUri: string, folder: string) {
  try {
    // 2. Llamada a la API de Cloudinary.
    //    'cloudinary.uploader.upload' recibe el archivo y las opciones.
    //    'resource_type: "auto"' permite que Cloudinary detecte si es una imagen, video, etc.
    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
      folder: folder,
      resource_type: 'auto',
    });

    // 3. Formateo de una respuesta exitosa.
    //    Devolvemos un objeto estructurado y predecible con los datos
    //    más importantes que necesitaremos en el frontend.
    return {
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      name: uploadResult.original_filename,
      type: `${uploadResult.resource_type}/${uploadResult.format}`,
      size: uploadResult.bytes,
    };
  } catch (error: any) {
    // 4. Manejo de errores.
    //    Si la subida falla, capturamos el error y devolvemos
    //    un objeto indicando el fallo con el mensaje de error.
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
