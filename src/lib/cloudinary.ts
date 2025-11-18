'use server';

export async function uploadImage(formData: FormData): Promise<{ imageUrl: string }> {
  const file = formData.get('image') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary configuration is missing from environment variables.');
    throw new Error('Server is not configured for image uploads.');
  }

  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('upload_preset', uploadPreset);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload failed:', errorData);
      throw new Error(`Failed to upload image. Status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      imageUrl: data.secure_url,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image.');
  }
}
