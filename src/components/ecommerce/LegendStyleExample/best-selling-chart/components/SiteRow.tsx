import { SiteDisplayData } from '../types';

interface SiteRowProps {
  site: SiteDisplayData;
}

export function SiteRow({ site }: SiteRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <img 
          src={site.favicon} 
          alt={`${site.siteName} favicon`}
          className="w-4 h-4 rounded-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="text-gray-500 text-theme-sm dark:text-gray-400">
          {site.siteName}
        </span>
      </div>
      <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
        {site.price}
      </span>
    </div>
  );
}
