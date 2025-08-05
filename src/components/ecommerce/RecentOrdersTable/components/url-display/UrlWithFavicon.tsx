import React from 'react';
import { UrlWithFaviconProps } from '../../interfaces/UrlDisplayTypes';
import { Favicon } from '../favicon/Favicon';
import { extractDomain } from '../../services/FaviconService';

export const UrlWithFavicon: React.FC<UrlWithFaviconProps> = ({ 
  url, 
  showUrl = true, 
  faviconSize = 'sm' 
}) => {
  const domain = extractDomain(url);
  
  return (
    <div className="flex items-center gap-2">
      <Favicon 
        url={url} 
        size={faviconSize}
        className="flex-shrink-0"
      />
      {showUrl && (
        <span className="text-sm text-gray-700 truncate" title={url}>
          {domain || url}
        </span>
      )}
    </div>
  );
};