interface ProductPrice {
  price: number;
  promotional_price?: number;
}

interface MarketplaceProductPrice {
  price: number;
  promotional_price?: number;
  old_price?: number;
  old_promotional_price?: number;
}

interface PriceInfo {
  originalPrice: number | null;
  promotionalPrice?: number;
  finalPrice: number;
  marginValue: number;
  priceWithCommission: number;
  discountPercentage: number;
}

interface PriceSimulationDisplayProps {
  commission: number; // Percentual da comissão (ex: 15 para 15%)
  productData?: any;
  layout?: "inline" | "block"; // Layout inline (uma linha) ou block (bloco)
  showMarginBelow?: boolean; // Se deve mostrar a margem abaixo
  className?: string;
  showOriginalPrice?: boolean; // Se deve sempre mostrar preço original (para marketplace)
}

/**
 * Componente reutilizável para exibir simulação de preços com comissão
 * Segue o padrão estabelecido no CommissionField
 */
export default function PriceSimulationDisplay({
  commission,
  productData,
  layout = "inline",
  showMarginBelow = true,
  className = "",
  showOriginalPrice = false
}: PriceSimulationDisplayProps) {
  // Extrai dados do produto para o simulador
  const extractedProductPrice = showOriginalPrice
    ? extractMarketplaceProductPrice(productData)
    : extractProductPrice(productData);
  const commissionValue = commission || 0;

  // Calcula valores para exibição
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };
  let priceInfo: PriceInfo | null = null;
  if (extractedProductPrice && commissionValue >= 0) {
    // Permite comissão 0 para marketplace
    const originalPrice = extractedProductPrice.price;
    const promotionalPrice = extractedProductPrice.promotional_price;

    // Para marketplace: usa os preços diretos do produto (com ou sem comissão já aplicada)
    // Para formulários: aplica comissão aos preços
    let finalPrice, priceWithCommission, marginValue;

    if (showOriginalPrice) {
      // Modo marketplace: não aplica comissão, usa preços diretos
      finalPrice = promotionalPrice || originalPrice;
      priceWithCommission = finalPrice;
      marginValue = 0; // Não mostra margem no marketplace
    } else {
      // Modo formulário: aplica comissão
      finalPrice = promotionalPrice || originalPrice;
      marginValue = (finalPrice * commissionValue) / 100;
      priceWithCommission = finalPrice + marginValue;    } // Busca preços antigos do productData para marketplace
    let oldPrice: number | null = null;

    if (showOriginalPrice && productData) {
      if (typeof productData === "object") {
        const rawOldPrice = productData.old_price
          ? parseFloat(productData.old_price)
          : null;
        // Só usa old_price se for maior que price atual
        oldPrice = rawOldPrice && rawOldPrice > originalPrice ? rawOldPrice : null;
      } else if (typeof productData === "string") {
        try {
          const parsed = JSON.parse(productData);
          const rawOldPrice = parsed.old_price ? parseFloat(parsed.old_price) : null;
          // Só usa old_price se for maior que price atual
          oldPrice = rawOldPrice && rawOldPrice > originalPrice ? rawOldPrice : null;
        } catch {
          // Ignore JSON parse errors, oldPrice will remain null
        }
      }
    }

    // Determina qual preço antigo usar e calcula desconto
    let displayOriginalPrice: number | null = null;
    let discountPercentage = 0;
    let shouldShowOriginalPrice = false;
    if (showOriginalPrice) {
      // Modo marketplace:
      // - Quando há promotional_price: mostra price vs promotional_price
      // - Quando não há promotional_price: mostra old_price vs price
      if (promotionalPrice) {
        displayOriginalPrice = originalPrice; // Usa price como valor antigo
        shouldShowOriginalPrice = true;
        discountPercentage = Math.round(
          ((originalPrice - promotionalPrice) / originalPrice) * 100
        );
      } else if (oldPrice) {
        displayOriginalPrice = oldPrice;
        shouldShowOriginalPrice = true;
        discountPercentage = Math.round(
          ((oldPrice - originalPrice) / oldPrice) * 100
        );
      }
    } else {
      // Modo formulário: mostra preço original com comissão vs promocional com comissão
      if (promotionalPrice) {
        const originalMarginValue = (originalPrice * commissionValue) / 100;
        const originalPriceWithCommission = originalPrice + originalMarginValue;
        displayOriginalPrice = originalPriceWithCommission;
        shouldShowOriginalPrice = true;
        discountPercentage = Math.round(
          ((originalPriceWithCommission - priceWithCommission) /
            originalPriceWithCommission) *
            100
        );
      }
    }
    priceInfo = {
      originalPrice: displayOriginalPrice,
      promotionalPrice: shouldShowOriginalPrice ? finalPrice : undefined,
      finalPrice,
      marginValue,
      priceWithCommission,
      discountPercentage
    };
  }

  // Se não há informações de preço, não renderiza nada
  if (!priceInfo) {
    return null;
  }

  // Layout inline (usado no CommissionField)
  if (layout === "inline") {
    return (
      <div className={className}>
        {" "}
        {/* Informações de preço inline */}
        <div className="flex flex-col items-start">
          {/* Preço original como label (se showOriginalPrice ou se houver desconto) */}
          {(showOriginalPrice || priceInfo.promotionalPrice) &&
            priceInfo.originalPrice && (
              <div className="text-xs text-gray-500 mb-1">
                {formatCurrency(priceInfo.originalPrice)}
              </div>
            )}{" "}
          {/* Preço final com comissão e porcentagem */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(priceInfo.priceWithCommission)}
            </span>
            {(showOriginalPrice || priceInfo.promotionalPrice) &&
              priceInfo.discountPercentage > 0 && (
                <span className="text-success-600 text-xs font-medium dark:text-success-500">
                  {priceInfo.discountPercentage}%{" "}
                  {showOriginalPrice ? "OFF" : "OFF"}
                </span>
              )}
          </div>
        </div>
        {/* Label da margem embaixo (se habilitado) */}
        {showMarginBelow && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Margem: {formatCurrency(priceInfo.marginValue)}
          </div>
        )}
      </div>
    );
  }

  // Layout block (versão expandida para outros contextos)
  return (
    <div className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Simulação de Preço com Comissão
      </div>

      <div className="space-y-2">
        {" "}
        {/* Preço original (se há desconto ou showOriginalPrice) */}
        {(priceInfo.promotionalPrice || showOriginalPrice) &&
          priceInfo.originalPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {showOriginalPrice
                  ? "Preço anterior:"
                  : "Preço original (c/ comissão):"}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(priceInfo.originalPrice)}
              </span>
              {priceInfo.discountPercentage > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium dark:bg-red-900/20 dark:text-red-400">
                  {priceInfo.discountPercentage}% OFF
                </span>
              )}
            </div>
          )}
        {/* Preço do artigo */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Preço do artigo:
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {formatCurrency(priceInfo.finalPrice)}
          </span>
        </div>
        {/* Margem (valor da comissão) */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Margem ({commissionValue}%):
          </span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            + {formatCurrency(priceInfo.marginValue)}
          </span>
        </div>
        {/* Separador */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
        {/* Preço final */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Preço final:
          </span>
          <span className="text-base font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(priceInfo.priceWithCommission)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Função específica para extrair dados de preço para marketplace
 * Preserva todos os campos: price, promotional_price, old_price, old_promotional_price
 */
export function extractMarketplaceProductPrice(
  productData: any
): MarketplaceProductPrice | null {
  if (!productData) return null;

  // Se é string, tenta fazer parse
  if (typeof productData === "string") {
    try {
      const parsed = JSON.parse(productData);
      return extractMarketplaceProductPrice(parsed);
    } catch {
      return null;
    }
  }  // Se é objeto, extrai todos os preços
  if (typeof productData === "object") {
    const price = productData.price
      ? parseBrazilianPrice(productData.price)
      : 0;
    const promotional_price = productData.promotional_price
      ? parseBrazilianPrice(productData.promotional_price)
      : undefined;
    const rawOldPrice = productData.old_price
      ? parseBrazilianPrice(productData.old_price)
      : undefined;
    const rawOldPromotionalPrice = productData.old_promotional_price
      ? parseBrazilianPrice(productData.old_promotional_price)
      : undefined;
    
    // Só usa old_price se for maior que price atual
    const old_price = rawOldPrice && rawOldPrice > price ? rawOldPrice : undefined;
    
    // Só usa old_promotional_price se for maior que promotional_price atual
    const old_promotional_price = rawOldPromotionalPrice && promotional_price && rawOldPromotionalPrice > promotional_price 
      ? rawOldPromotionalPrice 
      : undefined;
    
    return {
      price,
      promotional_price:
        promotional_price && !isNaN(promotional_price)
          ? promotional_price
          : undefined,
      old_price: old_price && !isNaN(old_price) ? old_price : undefined,
      old_promotional_price:
        old_promotional_price && !isNaN(old_promotional_price)
          ? old_promotional_price
          : undefined
    };
  }

  return null;
}

/**
 * Função para converter valor brasileiro para número
 */
function parseBrazilianPrice(value: any): number {
  if (!value) return 0;

  let str = String(value);

  // Remove símbolos de moeda e espaços
  str = str.replace(/[R$\s"\\]/g, "");

  // Tratamento específico para diferentes formatos
  if (str.includes(",") && str.includes(".")) {
    // Formato brasileiro completo: 1.000,50 ou 10.000,25
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    // Apenas vírgula: 1000,50
    str = str.replace(",", ".");
  } else if (str.includes(".")) {
    // Verificar se é decimal ou separador de milhares
    const parts = str.split(".");
    if (parts.length === 2 && parts[1].length <= 2) {
      // Provavelmente decimal: 1000.50 - mantém como está
    } else {
      // Separador de milhares: 1.000 ou 10.000
      str = str.replace(/\./g, "");
    }
  }

  const result = parseFloat(str);
  return isNaN(result) ? 0 : result;
}

/**
 * Função utilitária para extrair dados de preço de diferentes formatos
 * Baseada na função original do priceCommissionSimulator
 */
export function extractProductPrice(productData: any): ProductPrice | null {
  if (!productData) return null;

  // Se é string, tenta fazer parse
  if (typeof productData === "string") {
    try {
      const parsed = JSON.parse(productData);
      return extractProductPrice(parsed);
    } catch {
      // Se não conseguiu fazer parse como JSON, pode ser um valor direto como "R$ 4"
      const directPrice = parseBrazilianPrice(productData);
      if (!isNaN(directPrice) && directPrice > 0) {
        return {
          price: directPrice,
          promotional_price: undefined
        };
      }
      return null;
    }
  }
  // Se é objeto, extrai os preços
  if (typeof productData === "object") {
    // Prioriza old_price (valor sem comissão) sobre price
    const priceValue = productData.old_price || productData.price;
    const promotionalPriceValue =
      productData.old_promotional_price || productData.promotional_price;

    const price = parseBrazilianPrice(priceValue);
    const promotional_price = promotionalPriceValue
      ? parseBrazilianPrice(promotionalPriceValue)
      : undefined;

    if (isNaN(price)) return null;

    return {
      price,
      promotional_price:
        promotional_price && !isNaN(promotional_price)
          ? promotional_price
          : undefined
    };
  }

  return null;
}

/**
 * Hook personalizado para cálculos de preço com comissão
 */
export function usePriceCalculation(
  commission: number,
  productData: any,
  showOriginalPrice: boolean = false
) {
  const extractedProductPrice = extractProductPrice(productData);

  if (!extractedProductPrice || !commission || commission <= 0) {
    return null;
  }

  const originalPrice = extractedProductPrice.price;
  const promotionalPrice = extractedProductPrice.promotional_price;
  const finalPrice = promotionalPrice || originalPrice;
  const marginValue = (finalPrice * commission) / 100;
  const priceWithCommission = finalPrice + marginValue;

  // Calcula o preço original COM comissão (para exibir riscado)
  const originalMarginValue = (originalPrice * commission) / 100;
  const originalPriceWithCommission = originalPrice + originalMarginValue;

  // Para marketplace, sempre mostra desconto entre preço sem comissão vs com comissão
  // Para outros contextos, só mostra se há promotional_price
  const shouldShowOriginalPrice = showOriginalPrice || !!promotionalPrice;
  const displayOriginalPrice = showOriginalPrice
    ? originalPrice
    : originalPriceWithCommission;

  const discountPercentage = shouldShowOriginalPrice
    ? Math.round(
        ((displayOriginalPrice -
          (showOriginalPrice ? finalPrice : priceWithCommission)) /
          displayOriginalPrice) *
          100
      )
    : 0;

  return {
    originalPrice: displayOriginalPrice,
    promotionalPrice: shouldShowOriginalPrice
      ? showOriginalPrice
        ? finalPrice
        : promotionalPrice
      : undefined,
    finalPrice,
    marginValue,
    priceWithCommission,
    discountPercentage,
    hasDiscount: shouldShowOriginalPrice,
    formatCurrency: (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(value);
    }
  };
}
