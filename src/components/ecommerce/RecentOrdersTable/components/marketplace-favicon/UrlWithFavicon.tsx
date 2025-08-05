import React, { useState } from 'react';
import { getFaviconUrl } from '../../../../../components/form/utils/formatters';
import { DefaultFavicon } from './DefaultFavicon';

interface UrlWithFaviconProps {
  url: string;
  showFullUrl?: boolean;
  className?: string;
}

/**
 * Componente para renderizar URL com favicon
 * Implementação baseada no MarketplaceValueFormatter
 */
export const UrlWithFavicon: React.FC<UrlWithFaviconProps> = ({ 
  url, 
  showFullUrl = false,
  className = '' 
}) => {
  const [showFallback, setShowFallback] = useState(false);
  
  // Clean up the URL to remove protocol and trailing slash (mesma implementação da marketplace)
  let displayUrl = url;
  displayUrl = displayUrl.replace(/^https?:\/\//, "");
  displayUrl = displayUrl.replace(/\/$/, "");
  
  return (
    <div className={`url-cell flex items-center gap-2 ${className}`} style={{ gap: '8px' }}>
      <div 
        className="w-6 h-6 rounded-full border flex items-center justify-center"
        style={{
          backgroundColor: 'var(--favicon-bg-light)',
          borderColor: 'var(--favicon-border-light)'
        }}
      >
        {showFallback ? (
          <DefaultFavicon size={16} className="flex-shrink-0" />
        ) : (
          <img
            src={getFaviconUrl(url)}
            alt="Site icon"
            width="16"
            height="16"
            className="flex-shrink-0 rounded-sm"
            onError={() => {
              // Fallback para ícone padrão (mesma estratégia visual da marketplace)
              setShowFallback(true);
            }}
          />
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-gray-800 dark:text-white/90 hover:underline whitespace-nowrap"
        style={{ fontSize: '13px', lineHeight: '1.2' }}
      >
        {showFullUrl ? displayUrl : displayUrl.split('/')[0]}
      </a>
    </div>
  );
};
