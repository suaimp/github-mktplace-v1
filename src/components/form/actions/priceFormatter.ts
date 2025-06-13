/**
 * Lógica para verificação e formatação de preços de produtos
 * Verifica se productData.price é um objeto que contém promotional_price
 * para exibir promotional_price ou price baseado na disponibilidade
 */

interface ProductData {
  price: number | string;
  promotional_price?: number | string;
  [key: string]: any;
}

/**
 * Verifica se o promotional_price tem valor válido (não vazio, null, undefined ou 0)
 * @param promotionalPrice - O valor do promotional_price a ser verificado
 * @returns true se o promotional_price é válido e diferente de 0, false caso contrário
 */
export function hasValidPromotionalPrice(promotionalPrice: any): boolean {
  if (
    !promotionalPrice ||
    promotionalPrice === "" ||
    promotionalPrice === null ||
    promotionalPrice === undefined ||
    promotionalPrice.toString().trim() === ""
  ) {
    return false;
  }

  // Verifica se o valor é 0 (considera tanto número quanto string)
  const numericValue = parseFloat(
    promotionalPrice.toString().replace(/\./g, "").replace(",", ".")
  );
  if (!isNaN(numericValue) && numericValue === 0) {
    return false;
  }

  return true;
}

/**
 * Determina qual preço deve ser usado: promotional_price ou price
 * @param productData - Dados do produto contendo price e opcionalmente promotional_price
 * @returns O valor do preço a ser usado
 */
export function determinePrice(productData: ProductData): number | string {
  let priceValue: number | string;

  // Verifica se productData.price é um objeto que contém promotional_price
  if (
    productData.price === productData.price &&
    productData.promotional_price !== undefined
  ) {
    console.log("Product Data:", productData.promotional_price);

    // Se promotional_price tem valor setado (não vazio)
    if (hasValidPromotionalPrice(productData.promotional_price)) {
      priceValue = productData.promotional_price;
    } else {
      // Se promotional_price não tem valor setado, usa price normal
      priceValue = productData.price;
    }
  } else {
    // Se não for objeto, retorna productData.price diretamente
    priceValue = productData.price;
  }

  return priceValue;
}

/**
 * Versão mais robusta para determinar preço que funciona com diferentes estruturas
 * @param parsed - Objeto que pode conter price e/ou promotional_price
 * @returns O valor do preço a ser usado
 */
export function determinePriceRobust(parsed: any): number | string {
  // NOVA LÓGICA: verifica se promotional_price existe e não está vazio
  if (hasValidPromotionalPrice(parsed.promotional_price)) {
    // Se promotional_price tem valor válido, usa ele
    return parsed.promotional_price;
  } else {
    // Se promotional_price está vazio/null/undefined, usa price normal
    return parsed.price || 0;
  }
}

/**
 * Formata o preço no formato de moeda brasileira (BRL)
 * @param priceValue - Valor do preço a ser formatado
 * @returns String formatada em reais brasileiros ou o valor original em caso de erro
 */
export function formatPrice(priceValue: number | string): string {
  const price = parseFloat(priceValue.toString());

  if (!isNaN(price)) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(price);
  }

  return priceValue.toString();
}

/**
 * Função completa que determina e formata o preço do produto
 * @param productData - Dados do produto
 * @returns Preço formatado em reais brasileiros
 */
export function formatProductPrice(productData: ProductData): string {
  try {
    const priceValue = determinePrice(productData);
    return formatPrice(priceValue);
  } catch (err) {
    console.error("Error formatting price:", err);
    return productData.price?.toString() || "-";
  }
}

/**
 * Versão robusta da formatação de preço que funciona com diferentes estruturas
 * @param parsed - Objeto que pode conter price e/ou promotional_price
 * @returns Preço formatado em reais brasileiros
 */
export function formatProductPriceRobust(parsed: any): string {
  try {
    const priceValue = determinePriceRobust(parsed);
    return formatPrice(priceValue);
  } catch (err) {
    console.error("Error formatting price:", err);
    return parsed.price?.toString() || "-";
  }
}

/**
 * Processa o valor do produto, fazendo parse se necessário
 * @param value - Valor que pode ser string JSON ou objeto
 * @returns Preço formatado do produto
 */
export function processProductValue(value: any): string {
  try {
    const productData = typeof value === "string" ? JSON.parse(value) : value;
    return formatProductPrice(productData);
  } catch (err) {
    console.error("Error processing product value:", err);
    return value?.toString() || "-";
  }
}
