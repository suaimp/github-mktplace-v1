import { PromotionSiteDisplay, PromotionSitesService } from '../../../../services/db-services/promotion-services/promotionSitesService';

interface PromotionSiteItemProps {
  site: PromotionSiteDisplay;
  isLast?: boolean;
}

export default function PromotionSiteItem({ site, isLast = false }: PromotionSiteItemProps) {
  const displayUrl = PromotionSitesService.extractDomain(site.url);
  const formattedPercent = PromotionSitesService.formatPercent(site.percent);

  return (
    <div className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
      <span 
        className="text-gray-500 text-theme-sm dark:text-gray-400"
        title={site.url}
      >
        {displayUrl}
      </span>
      <span className="text-right text-gray-500 text-theme-sm dark:text-gray-400">
        {formattedPercent}
      </span>
    </div>
  );
}
