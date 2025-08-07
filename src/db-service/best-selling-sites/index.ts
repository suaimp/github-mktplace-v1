/**
 * Exports centralizados para serviços de Sites Mais Vendidos
 * Seguindo o princípio de responsabilidade única
 */

// Serviços
export { BestSellingSitesService } from './bestSellingSitesService';
export { PriceProcessingService } from './priceProcessingService';
export { SitePriceIntegrationService } from './sitePriceIntegrationService';

// Tipos
export type { BestSellingSite } from './bestSellingSitesService';
export type { 
  ProductPriceData, 
  ProcessedPriceInfo 
} from './priceProcessingService';
export type { SiteWithPriceData } from './sitePriceIntegrationService';
