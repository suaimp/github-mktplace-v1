/**
 * Lógica para cálculo e processamento de preços no marketplace
 * Inclui lógica para promotional_price e price
 */

export interface PriceValue {
  price?: string | number;
  promotional_price?: string | number;
  [key: string]: any;
}

/**
 * Limpa e converte uma string de preço para número
 * Remove caracteres não numéricos e converte vírgula para ponto
 */
export function cleanAndParsePrice(priceString: string | number): number {
  if (typeof priceString === "number") {
    return priceString;
  }

  const cleanPrice = String(priceString)
    .replace(/[^\d,\.]/g, "")
    .replace(",", ".");

  return parseFloat(cleanPrice) || 0;
}

/**
 * Verifica se um preço promocional é válido
 * Um preço promocional é válido se existe, não é vazio e é maior que 0
 */
export function isValidPromotionalPrice(
  promotionalPrice: string | number | null | undefined
): boolean {
  if (
    !promotionalPrice ||
    promotionalPrice === "" ||
    promotionalPrice === null ||
    promotionalPrice === undefined
  ) {
    return false;
  }

  const numericValue = cleanAndParsePrice(promotionalPrice);
  return !isNaN(numericValue) && numericValue > 0;
}

/**
 * Calcula o preço final do produto baseado na lógica de promotional_price
 * Prioriza promotional_price se disponível e válido, senão usa price
 */
export function calculateProductPrice(priceValue: any): number {
  try {
    // Se o valor é uma string, tenta fazer parse para número
    if (typeof priceValue === "string") {
      return cleanAndParsePrice(priceValue);
    }

    // Se o valor é um objeto, aplica a lógica de promotional_price
    if (typeof priceValue === "object" && priceValue) {
      // Priorizar promotional_price se disponível e válido
      if (
        priceValue.promotional_price &&
        isValidPromotionalPrice(priceValue.promotional_price)
      ) {
        return cleanAndParsePrice(priceValue.promotional_price);
      }

      // Fallback para price se promotional_price não for válido ou não existir
      if (priceValue.price) {
        return cleanAndParsePrice(priceValue.price);
      }
    }

    // Se chegou até aqui, retorna 0
    return 0;
  } catch (error) {
    console.error("Error calculating product price:", error);
    return 0;
  }
}

/**
 * Extrai e calcula o preço de um produto a partir dos valores de entrada
 * Utilizado no MarketplaceTable e BulkSelectionBar
 */
export function extractProductPrice(
  entry: any,
  productPriceField: any
): number {
  if (!productPriceField || !entry.values) {
    return 0;
  }

  try {
    const priceValue = entry.values[productPriceField.id];
    return calculateProductPrice(priceValue);
  } catch (error) {
    console.error("Error extracting product price:", error);
    return 0;
  }
}

/**
 * Determina qual preço está sendo usado (para debug/logging)
 * Retorna um objeto com informações sobre qual preço foi selecionado
 */
export function getPriceInfo(priceValue: any): {
  finalPrice: number;
  usedPromotionalPrice: boolean;
  originalPrice?: number;
  promotionalPrice?: number;
} {
  const result = {
    finalPrice: 0,
    usedPromotionalPrice: false,
    originalPrice: undefined as number | undefined,
    promotionalPrice: undefined as number | undefined
  };

  try {
    if (typeof priceValue === "object" && priceValue) {
      // Extrai os preços disponíveis
      if (priceValue.price) {
        result.originalPrice = cleanAndParsePrice(priceValue.price);
      }

      if (priceValue.promotional_price) {
        result.promotionalPrice = cleanAndParsePrice(
          priceValue.promotional_price
        );
      }

      // Determina qual preço usar
      if (
        result.promotionalPrice &&
        isValidPromotionalPrice(priceValue.promotional_price)
      ) {
        result.finalPrice = result.promotionalPrice;
        result.usedPromotionalPrice = true;
      } else if (result.originalPrice) {
        result.finalPrice = result.originalPrice;
        result.usedPromotionalPrice = false;
      }
    } else {
      // Valor direto (string ou número)
      result.finalPrice = cleanAndParsePrice(priceValue);
      result.usedPromotionalPrice = false;
    }
  } catch (error) {
    console.error("Error getting price info:", error);
  }

  return result;
}
