
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function buffer(file: File) {
    const bytes = await file.arrayBuffer();
    return Buffer.from(bytes);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileBuffer = await buffer(file);
    
    // Convert buffer to data URI
    const dataUri = `data:${file.type};base64,${fileBuffer.toString('base64')}`;

    // Use a direct upload method
    const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: 'image',
    });

    if (!result.secure_url) {
        throw new Error('Cloudinary did not return a secure URL.');
    }

    return NextResponse.json({ imageUrl: result.secure_url });

  } catch (error) {
    console.error('API Upload Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process upload', details: errorMessage }, { status: 500 });
  }
}

