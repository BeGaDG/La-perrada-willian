'use server';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Cargar explícitamente las variables de entorno desde el archivo .env
dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
