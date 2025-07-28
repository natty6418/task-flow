"use client";
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader } from 'lucide-react';
import { uploadProfilePicture, getOptimizedImageUrl } from '@/services/cloudinaryService';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  onUploadSuccess: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  showUploadButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-20 h-20 text-2xl'
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  name,
  size = 'lg',
  onUploadSuccess,
  onUploadError,
  disabled = false,
  showUploadButton = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select a valid image file';
      toast.error(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 5MB';
      toast.error(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading profile picture...', { id: 'avatar-upload' });
      
      const response = await uploadProfilePicture(file);
      
      toast.success('Profile picture updated successfully!', { id: 'avatar-upload' });
      onUploadSuccess(response.secure_url);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMsg, { id: 'avatar-upload' });
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const optimizedAvatarUrl = currentAvatarUrl 
    ? getOptimizedImageUrl(currentAvatarUrl, { width: 400, height: 400 })
    : null;

  return (
    <div className={`relative ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
        aria-label="Upload profile picture"
      />

      {/* Avatar container */}
      <div
        className={`
          relative ${sizeClasses[size]} rounded-full overflow-hidden
          ${dragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${showUploadButton && !disabled ? 'cursor-pointer group' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={showUploadButton && !disabled ? triggerFileInput : undefined}
        title={showUploadButton && !disabled ? 'Click to upload new profile picture' : undefined}
      >
        {/* Avatar Image or Initials */}
        {optimizedAvatarUrl ? (
          <Image
            src={optimizedAvatarUrl}
            alt={`${name}'s profile picture`}
            className="w-full h-full object-cover"
            width={400}
            height={400}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {uploading ? (
              <Loader className="w-1/2 h-1/2 animate-spin" />
            ) : (
              getInitials(name)
            )}
          </div>
        )}

        {/* Upload overlay */}
        {showUploadButton && !disabled && !uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center">
            <Camera className="w-1/3 h-1/3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader className="w-1/3 h-1/3 text-white animate-spin" />
          </div>
        )}

        {/* Camera icon for edit mode */}
        {showUploadButton && !disabled && size === 'lg' && (
          <button 
            className="absolute bottom-0 right-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
            disabled={uploading}
            title="Change profile picture"
          >
            {uploading ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              <Camera className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Upload button for smaller sizes */}
      {showUploadButton && !disabled && size !== 'lg' && (
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change photo'}
        </button>
      )}

      {/* Drag and drop hint */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed rounded-full flex items-center justify-center">
          <Upload className="w-1/3 h-1/3 text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
