export interface UrlDisplayProps {
  urls: string[];
}

export interface FaviconProps {
  url: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface UrlWithFaviconProps {
  url: string;
  showUrl?: boolean;
  faviconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}
