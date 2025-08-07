import { PromotionSiteDisplay, PromotionSitesService } from '../../../../services/db-services/promotion-services/promotionSitesService';
import { extractCleanDomain } from '../../../../components/form/utils/formatters';
import { PriceDisplay } from '../../../common/price';

interface PromotionSiteItemProps {
  site: PromotionSiteDisplay;
  isLast?: boolean;
}

export default function PromotionSiteItem({ site, isLast = false }: PromotionSiteItemProps) {
  // Usa o domínio limpo para exibição
  const displayUrl = extractCleanDomain(site.url);

  // Função para gerar URL do favicon
  const getFaviconUrl = (url: string): string => {
    try {
      const domain = PromotionSitesService.extractDomain(url);
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return `https://www.google.com/s2/favicons?domain=default.com&sz=16`;
    }
  };

  // Converte dados para formato do PriceDisplay
  const priceData = {
    price: site.price.toString(),
    promotionalPrice: site.promotional_price.toString(),
    hasPromotion: site.promotional_price > 0 && site.promotional_price < site.price
  };

  return (
    <div className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
      <div className="flex items-center gap-2">
        <img
          src={getFaviconUrl(site.url)}
          alt={`${displayUrl} favicon`}
          className="w-4 h-4 rounded-sm flex-shrink-0"
          onError={(e) => {
            // Fallback para um ícone padrão caso o favicon não carregue
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'%3E%3C/path%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'%3E%3C/path%3E%3C/svg%3E";
          }}
        />
        <span 
          className="text-gray-500 text-theme-sm dark:text-gray-400"
          title={site.url}
        >
          {displayUrl}
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
