import Input from "../input/InputField";
import { extractProductPrice } from "./actions/priceCommissionSimulator";

interface CommissionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
  // Props adicionais para a simulação de preço
  productData?: any;
}

interface PriceInfo {
  originalPrice: number;
  promotionalPrice?: number;
  finalPrice: number;
  marginValue: number;
  priceWithCommission: number;
  discountPercentage: number;
}

export default function CommissionField({
  value,
  onChange,
  error,
  onErrorClear,
  productData
}: CommissionFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(
      1000,
      Math.max(0, parseFloat(e.target.value) || 0)
    );
    onChange(newValue.toString());

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  // Extrai dados do produto para o simulador
  const extractedProductPrice = extractProductPrice(productData);
  const commissionValue = parseFloat(value) || 0;

  // Calcula valores para exibição inline
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  let priceInfo: PriceInfo | null = null;
  if (extractedProductPrice && commissionValue > 0) {
    const originalPrice = extractedProductPrice.price;
    const promotionalPrice = extractedProductPrice.promotional_price;
    const finalPrice = promotionalPrice || originalPrice;
    const marginValue = (finalPrice * commissionValue) / 100;
    const priceWithCommission = finalPrice + marginValue;
    const discountPercentage = promotionalPrice
      ? Math.round(((originalPrice - promotionalPrice) / originalPrice) * 100)
      : 0;

    priceInfo = {
      originalPrice,
      promotionalPrice,
      finalPrice,
      marginValue,
      priceWithCommission,
      discountPercentage
    };
  }

  return (
    <div>
      {/* Input e informações de preço na mesma linha */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value || ""}
            onChange={handleChange}
            min="0"
            max="1000"
            step={0.01}
            placeholder="0.00"
            error={!!error}
            hint={error}
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
        </div>

        {/* Informações de preço ao lado do input */}
        {priceInfo && (
          <div className="flex flex-col ml-[205px]">
            {/* Preço original como label (se houver desconto) */}
            {priceInfo.promotionalPrice && (
              <div className="text-xs text-gray-500 line-through mb-1">
                {formatCurrency(priceInfo.originalPrice)}
              </div>
            )}

            {/* Preço final com comissão e porcentagem */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(priceInfo.priceWithCommission)}
              </span>
              {priceInfo.promotionalPrice && (
                <span className="text-green-600 text-xs font-medium dark:text-green-400">
                  {priceInfo.discountPercentage}% OFF
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Label da margem embaixo do input */}
      {priceInfo && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Margem: {formatCurrency(priceInfo.marginValue)}
        </div>
      )}
    </div>
  );
}
