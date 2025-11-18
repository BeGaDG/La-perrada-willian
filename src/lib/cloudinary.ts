'use server';

import { v2 as cloudinary } from 'cloudinary';
import { getConfig } from 'next/config';

// Obtener las variables de configuración del servidor
const { serverRuntimeConfig } = getConfig();
const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = serverRuntimeConfig;

// Verificar que las variables están presentes
if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error('Cloudinary configuration is missing in next.config.js');
}

// Configurar Cloudinary con las variables obtenidas
cloudinary.config({ 
  cloud_name: cloudinaryCloudName, 
  api_key: cloudinaryApiKey, 
  api_secret: cloudinaryApiSecret,
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
          tags: ['la-perrada-de-william'],
          upload_preset: undefined, // Not using presets for signed uploads
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
