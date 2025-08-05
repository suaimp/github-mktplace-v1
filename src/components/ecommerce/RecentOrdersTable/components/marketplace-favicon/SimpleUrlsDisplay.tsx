import React from 'react';
import { extractCleanDomain } from '../../../../../components/form/utils/formatters';

interface SimpleUrlsDisplayProps {
  urls: string[];
  className?: string;
}

/**
 * Componente para exibir URLs como texto simples (não clicável)
 */
export const SimpleUrlsDisplay: React.FC<SimpleUrlsDisplayProps> = ({ 
  urls, 
  className = '' 
}) => {
  if (!urls || urls.length === 0) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        Nenhuma URL
      </div>
    );
  }

  if (urls.length === 1) {
    // Caso 1: Apenas 1 URL - exibir apenas o domínio limpo
    const cleanUrl = extractCleanDomain(urls[0]);
    return (
      <div className={`text-gray-800 dark:text-white/90 text-sm ${className}`}>
        {cleanUrl}
      </div>
    );
  }

  // Caso 2: Múltiplas URLs - mostrar primeira + contador
  const mainUrl = extractCleanDomain(urls[0]);
  const extraCount = urls.length - 1;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-gray-800 dark:text-white/90 text-sm">
        {mainUrl}
      </span>
      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
        +{extraCount}
      </span>
    </div>
  );
};
