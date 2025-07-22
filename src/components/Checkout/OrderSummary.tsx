import { formatCurrency } from "../marketplace/utils";
import { useCouponContext } from "./hooks/useCouponContext";

interface OrderSummaryProps {
  items: any[];
  totalProductPrice: number;
  totalContentPrice: number;
  totalFinalPrice: number;
  appliedCouponId?: string | null;
  discountValue?: number;
  showDiscountFromProps?: boolean; // Para controlar se deve usar desconto das props ou contexto
}

export default function OrderSummary({
  items,
  totalProductPrice,
  totalContentPrice,
  totalFinalPrice,
  appliedCouponId,
  discountValue: propDiscountValue = 0,
  showDiscountFromProps = false
}: OrderSummaryProps) {
  // Usar o total_final_price em vez de calcular manualmente
  const total = totalFinalPrice;
  const { discountValue: contextDiscountValue, appliedCoupon } = useCouponContext();

  // Decidir qual fonte de desconto usar
  const finalDiscountValue = showDiscountFromProps ? propDiscountValue : contextDiscountValue;
  const finalAppliedCoupon = showDiscountFromProps ? { code: `CUPOM-${appliedCouponId?.slice(-4)}` } : appliedCoupon;

  console.log("📋 [ORDER SUMMARY] Valores recebidos:", {
    totalProductPrice,
    totalContentPrice,
    totalFinalPrice,
    total,
    propDiscountValue,
    contextDiscountValue: contextDiscountValue,
    appliedCoupon: appliedCoupon?.code,
    showDiscountFromProps,
    finalDiscountValue,
    appliedCouponId
  });

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 sticky top-24">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Resumo do pedido
      </h3>

      {items.length > 0 ? (
        <div className="mb-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between mb-2">
              <div className="font-bold">
                {item.quantity} x {item.product_url || "Produto"}
              </div>
              <div>{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold">Carregando itens...</div>
          </div>
        </div>
      )}

      <div className="my-4 border-t border-b border-t-gray-300 border-b-gray-300 dark:border-t-gray-700 dark:border-b-gray-700 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>Valor</div>
          <div>{formatCurrency(totalProductPrice)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>Conteúdo</div>
          <div>{formatCurrency(totalContentPrice)}</div>
        </div>
        {finalAppliedCoupon && finalDiscountValue > 0 && (
          <div className="flex items-center justify-between mt-2 text-green-600 dark:text-green-400">
            <div>Desconto ({finalAppliedCoupon.code})</div>
            <div>-{formatCurrency(finalDiscountValue)}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="font-medium">Total</div>
        <div>
          <span className="font-bold">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
