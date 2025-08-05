import React from 'react';
import { UrlDisplayProps } from '../../interfaces/UrlDisplayTypes';
import { UrlWithFavicon } from './UrlWithFavicon';
import { Favicon } from '../favicon/Favicon';

/**
 * Componente que exibe URLs seguindo as regras específicas:
 * - 1 URL: Exibe a URL com favicon à esquerda
 * - Múltiplas URLs: Exibe a primeira URL com favicon + 2 favicons adicionais à esquerda
 */
export const UrlDisplay: React.FC<UrlDisplayProps> = ({ urls }) => {
  if (!urls || urls.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        Nenhuma URL
      </div>
    );
  }

  if (urls.length === 1) {
    // Caso 1: Apenas 1 URL - exibir URL com favicon à esquerda
    return (
      <UrlWithFavicon 
        url={urls[0]} 
        showUrl={true} 
        faviconSize="sm" 
      />
    );
  }

  // Caso 2: Múltiplas URLs - exibir primeira URL + 2 favicons extras à esquerda
  const firstUrl = urls[0];
  const additionalUrls = urls.slice(1, 3); // Próximas 2 URLs

  return (
    <div className="flex items-center">
      {/* Favicons adicionais à esquerda (máximo 2) */}
      <div className="flex items-center gap-1 mr-2">
        {additionalUrls.map((url, index) => (
          <Favicon 
            key={index}
            url={url} 
            size="sm"
            className="opacity-70"
          />
        ))}
      </div>
      
      {/* URL principal com favicon */}
      <UrlWithFavicon 
        url={firstUrl} 
        showUrl={true} 
        faviconSize="sm" 
      />
    </div>
  );
};
