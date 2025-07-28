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

  try {
    // Use our API route for more secure uploads
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
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
