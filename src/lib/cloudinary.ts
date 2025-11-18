'use server';

import { v2 as cloudinary } from 'cloudinary';

// Lee las variables de entorno directamente del proceso del servidor
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

// Verificar que las variables están presentes
if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
  throw new Error('Cloudinary environment variables are missing. Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_UPLOAD_PRESET are set in your .env file.');
}

// Configurar Cloudinary con las variables obtenidas
cloudinary.config({ 
  cloud_name: cloudName, 
  api_key: apiKey, 
  api_secret: apiSecret,
  secure: true
});

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload to Cloudinary
  try {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          upload_preset: uploadPreset, // Usar el upload_preset
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      ).end(buffer);
    });

    return {
      imageUrl: result.secure_url,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image.');
  }
}
