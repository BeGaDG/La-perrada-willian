
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      
      const readableStream = new Readable();
      readableStream._read = () => {}; // _read is required but you can no-op it
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });

    // Ensure result is of a type that has secure_url
    const uploadResult = result as { secure_url?: string };

    if (!uploadResult || !uploadResult.secure_url) {
      console.error('Cloudinary did not return a secure URL. Full result:', uploadResult);
      throw new Error('Cloudinary did not return a secure URL.');
    }

    return NextResponse.json({ imageUrl: uploadResult.secure_url });

  } catch (error) {
    console.error('API Upload Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process upload', details: errorMessage }, { status: 500 });
  }
}
