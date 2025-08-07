export interface PriceData {
  price: string;
  promotionalPrice?: string;
  oldPrice?: string;
  hasPromotion: boolean;
}

export interface PriceDisplayProps {
  priceData: PriceData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
}
