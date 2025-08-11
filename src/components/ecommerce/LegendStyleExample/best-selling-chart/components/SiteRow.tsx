import { SiteDisplayData } from '../types';
import { PriceDisplay } from '../../../../common/price';

interface SiteRowProps {
  site: SiteDisplayData;
}

export function SiteRow({ site }: SiteRowProps) {
  const priceData = {
    price: site.price,
    promotionalPrice: site.promotionalPrice,
    oldPrice: site.oldPrice,
    hasPromotion: site.hasPromotion
  };

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
      <PriceDisplay 
        priceData={priceData}
        size="sm"
        alignment="right"
      />
    </div>
  );
}
