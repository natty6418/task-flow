"use client";
import React from 'react';
import { getOptimizedImageUrl } from '@/services/cloudinaryService';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4'
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  showOnlineStatus = false,
  isOnline = false
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const optimizedSrc = src ? getOptimizedImageUrl(src) : null;

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0`}>
        {optimizedSrc ? (
          <img
            src={optimizedSrc}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {getInitials(name)}
          </div>
        )}
      </div>
      
      {showOnlineStatus && (
        <div className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        } border-2 border-white rounded-full`} />
      )}
    </div>
  );
};

export default Avatar;
