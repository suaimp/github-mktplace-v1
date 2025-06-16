interface ProductPrice {
  price: number;
  promotional_price?: number;
}

interface PriceCommissionSimulatorProps {
  commission: number; // Percentual da comissão (ex: 15 para 15%)
  productPrice: ProductPrice | null;
  className?: string;
}

export default function PriceCommissionSimulator({
  commission,
  productPrice,
  className = ""
}: PriceCommissionSimulatorProps) {
  // Se não há preço ou comissão, não exibe nada
  if (!productPrice || !commission || commission <= 0) {
    return null;
  }

  const originalPrice = productPrice.price;
  const promotionalPrice = productPrice.promotional_price;
  const finalPrice = promotionalPrice || originalPrice;

  // Calcula a margem (valor da comissão)
  const marginValue = (finalPrice * commission) / 100;

  // Calcula o preço final com comissão
  const priceWithCommission = finalPrice + marginValue;

  // Calcula o desconto se há preço promocional
  const discountPercentage = promotionalPrice
    ? Math.round(((originalPrice - promotionalPrice) / originalPrice) * 100)
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div
      className={`mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}
    >
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Simulação de Preço com Comissão
      </div>

      <div className="space-y-2">
        {/* Preço original (se há desconto) */}
        {promotionalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Preço original:
            </span>
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium dark:bg-red-900/20 dark:text-red-400">
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Preço do artigo */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Preço do artigo:
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {formatCurrency(finalPrice)}
          </span>
        </div>

        {/* Margem (valor da comissão) */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Margem ({commission}%):
          </span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            + {formatCurrency(marginValue)}
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
            {formatCurrency(priceWithCommission)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Função utilitária para extrair dados de preço de diferentes formatos
export function extractProductPrice(productData: any): ProductPrice | null {
  if (!productData) return null;

  // Se é string, tenta fazer parse
  if (typeof productData === "string") {
    try {
      const parsed = JSON.parse(productData);
      return extractProductPrice(parsed);
    } catch {
      return null;
    }
  }

  // Se é objeto, extrai os preços
  if (typeof productData === "object") {
    const price = parseFloat(productData.price);
    const promotional_price = productData.promotional_price
      ? parseFloat(productData.promotional_price)
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
