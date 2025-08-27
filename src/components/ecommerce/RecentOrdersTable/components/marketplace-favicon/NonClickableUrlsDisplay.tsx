import React, { useState } from 'react';
import { getFaviconUrl, extractCleanDomain } from '../../../../../components/form/utils/formatters';
import { DefaultFavicon } from './DefaultFavicon';

interface NonClickableUrlsDisplayProps {
  urls: string[];
  className?: string;
}

/**
 * Limpa e formata uma URL para exibição (baseado no MarketplaceValueFormatter)
 */
function cleanUrlForDisplay(url: string): string {
  if (!url) return '';
  return extractCleanDomain(url);
}

/**
 * Componente para exibir múltiplas URLs com favicons mas sem links clicáveis
 */
export const NonClickableUrlsDisplay: React.FC<NonClickableUrlsDisplayProps> = ({ 
  urls, 
  className = '' 
}) => {
  const [failedFavicons, setFailedFavicons] = useState<Set<number>>(new Set());

  if (!urls || urls.length === 0) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        Nenhuma URL
      </div>
    );
  }

  if (urls.length === 1) {
    // Caso 1: Apenas 1 URL - exibir URL com favicon à esquerda (mesmo estilo do UrlWithFavicon)
    return (
      <div className={`url-cell flex items-center gap-2 ${className}`} style={{ gap: '8px' }}>
        <div 
          className="w-6 h-6 rounded-full border flex items-center justify-center"
          style={{
            backgroundColor: 'var(--favicon-bg-light)',
            borderColor: 'var(--favicon-border-light)'
          }}
        >
          <img
            src={getFaviconUrl(urls[0])}
            alt="Site icon"
            width="16"
            height="16"
            className="flex-shrink-0 rounded-sm"
            onError={() => {
              // Se falhar, podemos mostrar um fallback
            }}
          />
        </div>
        <span 
          className="font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap"
          style={{ fontSize: '13px', lineHeight: '1.2' }}
        >
          {cleanUrlForDisplay(urls[0])}
        </span>
      </div>
    );
  }

  // Caso 2: Múltiplas URLs - primeira URL + favicons extras à esquerda (sem links)
  const mainUrl = urls[0];
  const extraUrls = urls.slice(1, 3); // Máximo 2 URLs extras (para exibir 2 ícones extras)

  const handleFaviconError = (index: number) => {
    setFailedFavicons(prev => new Set(prev).add(index));
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Container de favicons sobrepostos */}
      <div className="flex items-center -space-x-2 mr-3">
        {/* Favicons extras (índices 1 e 2) - ficam por baixo */}
        {extraUrls.map((url, index) => (
          <div 
            key={`extra-${index}`}
            className="w-6 h-6 rounded-full border flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--favicon-bg-light)',
              borderColor: 'var(--favicon-border-light)'
            }}
          >
            {failedFavicons.has(index) ? (
              <DefaultFavicon 
                size={16} 
                className="flex-shrink-0" 
              />
            ) : (
              <img
                src={getFaviconUrl(url)}
                alt="Site icon"
                width="16"
                height="16"
                className="flex-shrink-0 rounded-sm"
                onError={() => handleFaviconError(index)}
              />
            )}
          </div>
        ))}
        
        {/* Favicon principal - fica por cima de todos */}
        <div 
          className="w-6 h-6 rounded-full border flex items-center justify-center"
          style={{ 
            backgroundColor: 'var(--favicon-bg-light)',
            borderColor: 'var(--favicon-border-light)'
          }}
        >
          <img
            src={getFaviconUrl(mainUrl)}
            alt="Site icon"
            width="16"
            height="16"
            className="flex-shrink-0 rounded-sm"
            onError={() => {
              // Se falhar, mostramos fallback
            }}
          />
        </div>
      </div>
      
      {/* Texto da URL principal (sem link, mas mesmo estilo) */}
      <span
        className="font-semibold text-gray-800 dark:text-white/90 whitespace-nowrap"
        style={{ fontSize: '13px', lineHeight: '1.2' }}
      >
        {cleanUrlForDisplay(mainUrl)}
      </span>
    </div>
  );
};
