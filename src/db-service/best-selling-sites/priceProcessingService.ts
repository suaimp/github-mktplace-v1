/**
 * Tipos para processamento de preços
 */
export interface ProductPriceData {
  price?: string;
  promotional_price?: string;
  old_price?: string;
  old_promotional_price?: string;
}

export interface ProcessedPriceInfo {
  originalPrice: number;
  promotionalPrice?: number;
  discountPercentage: number;
  formattedPrice: string;
  isPromotional: boolean;
}

/**
 * Serviço responsável pelo processamento de preços de produtos
 * Implementa a mesma lógica do MarketplaceValueFormatter
 * Segue o princípio de responsabilidade única
 */
export class PriceProcessingService {
  /**
   * Converte string de preço brasileiro para número
   */
  private static parsePrice(priceString: string): number {
    if (!priceString) return 0;
    
    // Remove símbolos e converte vírgula para ponto
    const cleanPrice = priceString
      .toString()
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    const parsed = parseFloat(cleanPrice);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Formata número para moeda brasileira
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  /**
   * Processa dados de preço seguindo a lógica do MarketplaceValueFormatter
   */
  static processProductPrice(productData: ProductPriceData): ProcessedPriceInfo | null {
    if (!productData) return null;

    let priceToUse: number | null = null;
    let originalPrice: number | null = null;
    let isPromotional = false;

    // 1. Primeiro tenta promotional_price (seguindo MarketplaceValueFormatter)
    if (productData.promotional_price) {
      const promotionalPrice = this.parsePrice(productData.promotional_price);
      if (promotionalPrice > 0) {
        priceToUse = promotionalPrice;
        isPromotional = true;
      }
    }

    // 2. Se não há promotional_price válido, usa price
    if (priceToUse === null && productData.price) {
      const regularPrice = this.parsePrice(productData.price);
      if (regularPrice > 0) {
        priceToUse = regularPrice;
        originalPrice = regularPrice;
      }
    }

    // 3. Se encontrou promotional_price, também pega o price para calcular desconto
    if (isPromotional && productData.price) {
      const regularPrice = this.parsePrice(productData.price);
      if (regularPrice > 0) {
        originalPrice = regularPrice;
      }
    }

    // Se não conseguiu extrair nenhum preço
    if (priceToUse === null || priceToUse <= 0) {
      return null;
    }

    // Calcula percentual de desconto
    const discountPercentage = isPromotional && originalPrice && originalPrice > priceToUse 
      ? Math.round(((originalPrice - priceToUse) / originalPrice) * 100)
      : 0;

    return {
      originalPrice: originalPrice || priceToUse,
      promotionalPrice: isPromotional ? priceToUse : undefined,
      discountPercentage,
      formattedPrice: this.formatCurrency(priceToUse),
      isPromotional
    };
  }

  /**
   * Converte value_json para ProductPriceData
   */
  static extractPriceData(valueJson: any): ProductPriceData | null {
    if (!valueJson || typeof valueJson !== 'object') {
      return null;
    }

    return {
      price: valueJson.price,
      promotional_price: valueJson.promotional_price,
      old_price: valueJson.old_price,
      old_promotional_price: valueJson.old_promotional_price
    };
  }
}
