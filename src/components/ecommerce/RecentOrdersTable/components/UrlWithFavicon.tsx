import { useState, useEffect } from 'react';
import { getFaviconUrl } from '../services/FaviconService.ts';

interface UrlWithFaviconProps {
  url: string;
  maxDisplayLength?: number;
}

export function UrlWithFavicon({ url, maxDisplayLength = 30 }: UrlWithFaviconProps) {
  const [faviconUrl, setFaviconUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const loadFavicon = async () => {
      try {
        const favicon = getFaviconUrl(url);
        setFaviconUrl(favicon);
      } catch (error) {
        console.warn('Failed to load favicon for:', url);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavicon();
  }, [url]);

  if (!url) {
    return <span className="text-gray-400">-</span>;
  }

  // Extract display URL
  let displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (displayUrl.length > maxDisplayLength) {
    displayUrl = displayUrl.substring(0, maxDisplayLength) + '...';
  }

  return (
    <div className="flex items-center gap-2 max-w-full">
      {!isLoading && faviconUrl && (
        <img
          src={faviconUrl}
          alt=""
          className="w-4 h-4 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate"
        title={url}
      >
        {displayUrl}
      </a>
    </div>
  );
}

interface MultipleUrlsWithFaviconsProps {
  urls: string[];
  maxUrls?: number;
}

export function MultipleUrlsWithFavicons({ urls, maxUrls = 3 }: MultipleUrlsWithFaviconsProps) {
  if (!urls || urls.length === 0) {
    return <span className="text-gray-400">Nenhuma URL</span>;
  }

  const displayUrls = urls.slice(0, maxUrls);
  const remainingCount = urls.length - maxUrls;

  return (
    <div className="space-y-1">
      {displayUrls.map((url, index) => (
        <UrlWithFavicon key={`${url}-${index}`} url={url} />
      ))}
      {remainingCount > 0 && (
        <div className="text-xs text-gray-500">
          +{remainingCount} mais
        </div>
      )}
    </div>
  );
}
