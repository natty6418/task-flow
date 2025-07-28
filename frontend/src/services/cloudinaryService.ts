export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

export const uploadProfilePicture = async (file: File): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
  formData.append('folder', 'profile-pictures');
  
  // Add transformation for profile pictures
  formData.append('transformation', JSON.stringify([
    { width: 400, height: 400, crop: 'fill', quality: 'auto' },
    { fetch_format: 'auto' }
  ]));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload profile picture');
  }
};

export const deleteProfilePicture = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete profile picture');
  }
};

export const getOptimizedImageUrl = (avatarUrl: string, options?: {
  width?: number;
  height?: number;
}): string => {
  if (!avatarUrl) return '';
  
  // If it's already a Cloudinary URL, we can add transformations
  if (avatarUrl.includes('cloudinary.com')) {
    const baseUrl = avatarUrl.split('/upload/')[0] + '/upload/';
    const imagePath = avatarUrl.split('/upload/')[1];
    const transformation = `w_${options?.width || 400},h_${options?.height || 400},c_fill,q_auto,f_auto/`;
    return baseUrl + transformation + imagePath;
  }
  
  // Return original URL if not from Cloudinary
  return avatarUrl;
};
