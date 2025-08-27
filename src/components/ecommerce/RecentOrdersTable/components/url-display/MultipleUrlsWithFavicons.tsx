import { Favicon } from '../favicon/Favicon';
import { UrlWithFavicon } from './UrlWithFavicon';

interface MultipleUrlsWithFaviconsProps {
  urls: string[];
  maxExtraFavicons?: number;
  faviconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente responsável por renderizar múltiplas URLs com favicons
 * Implementa a lógica específica dos pedidos:
 * - 1 URL: favicon + URL
 * - Múltiplas URLs: favicons extras à esquerda + favicon principal + primeira URL
 */
export function MultipleUrlsWithFavicons({ 
  urls, 
  maxExtraFavicons = 2, 
  faviconSize = 'sm',
  className = '' 
}: MultipleUrlsWithFaviconsProps) {
  if (!urls || urls.length === 0) {
    return <span className="text-gray-400 text-sm">Sem URL</span>;
  }

  const mainUrl = urls[0];
  const extraUrls = urls.slice(1, maxExtraFavicons + 1);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Favicons extras à esquerda (quando há mais de 1 URL) */}
      {extraUrls.length > 0 && (
        <div className="flex -space-x-2 mr-1">
          {extraUrls.map((url, index) => (
            <div key={index}>
              <Favicon
                url={url}
                size={faviconSize}
                className="rounded-full border border-gray-200 bg-white"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* URL principal com favicon */}
      <UrlWithFavicon 
        url={mainUrl} 
        faviconSize={faviconSize}
        className="flex-1 min-w-0"
      />
    </div>
  );
}
