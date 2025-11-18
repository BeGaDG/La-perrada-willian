'use server';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function buffer(file: File) {
    const bytes = await file.arrayBuffer()
    return Buffer.from(bytes)
}

export async function uploadImage(formData: FormData): Promise<{ imageUrl: string }> {
    const file = formData.get('image') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    const fileBuffer = await buffer(file);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error('Failed to upload image.'));
                }
                if (!result) {
                    return reject(new Error('Cloudinary did not return a result.'));
                }
                resolve({ imageUrl: result.secure_url });
            }
        );

        const readableStream = new Readable();
        readableStream._read = () => {}; // _read is required but can be a no-op
        readableStream.push(fileBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
}
