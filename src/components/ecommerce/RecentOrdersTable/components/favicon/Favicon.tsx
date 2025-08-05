import React, { useState } from 'react';
import { FaviconProps } from '../../interfaces/UrlDisplayTypes';
import { getFaviconFallbackUrls } from '../../services/FaviconService';

export const Favicon: React.FC<FaviconProps> = ({ 
  url, 
  size = 'sm', 
  className = '' 
}) => {
  const [currentFaviconIndex, setCurrentFaviconIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const faviconUrls = getFaviconFallbackUrls(url);
  const currentFaviconUrl = faviconUrls[currentFaviconIndex];
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleError = () => {
    if (currentFaviconIndex < faviconUrls.length - 1) {
      setCurrentFaviconIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentFaviconUrl) {
    // Fallback: ícone SVG genérico
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded flex items-center justify-center`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="12" height="12" fill="#9CA3AF"/>
          <path d="M6 3H9V9H3V3H6ZM6 4.5L4.5 6L6 7.5V4.5Z" fill="white"/>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={currentFaviconUrl}
      alt="Site favicon"
      className={`${sizeClasses[size]} ${className} rounded`}
      onError={handleError}
      loading="lazy"
    />
  );
};
