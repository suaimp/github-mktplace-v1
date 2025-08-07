export interface BestSellingSiteData {
  id: string;
  entry_id: string;
  product_name: string;
  product_url: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PriceData {
  price: string;
  old_price?: string;
  promotional_price?: string;
  old_promotional_price?: string;
}

export interface SiteDisplayData {
  siteName: string;
  siteUrl: string;
  price: string;
  promotionalPrice?: string;
  oldPrice?: string;
  hasPromotion: boolean;
  quantity: number;
  favicon?: string;
}

export interface FormEntryPrice {
  value?: string | null;
  value_json?: PriceData | null;
}
