import { useState, useEffect, useCallback } from "react";
import { validateCoupon, calculateDiscount } from "../../../../services/db-services/coupons/couponService";
import { Coupon } from "../../../../pages/Coupons/types";
import { useCouponContext } from "../../hooks/useCouponContext";

interface UseCouponDiscountResult {
  loading: boolean;
  error: string | null;
  appliedCoupon: Coupon | null;
  discountValue: number;
  validate: () => void;
}

export function useCouponDiscount(couponCode: string, orderTotal: number): UseCouponDiscountResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  
  // Usar o contexto para sincronizar o estado global
  const { setAppliedCoupon: setGlobalCoupon, setDiscountValue: setGlobalDiscount, clearCoupon } = useCouponContext();

  const validate = useCallback(() => {
    if (!couponCode || !orderTotal) {
      setAppliedCoupon(null);
      setDiscountValue(0);
      setError(null);
      clearCoupon();
      return;
    }
    setLoading(true);
    setError(null);
    validateCoupon(couponCode, orderTotal)
      .then((result) => {
        if (result.valid && result.coupon) {
          setAppliedCoupon(result.coupon);
          const discount = calculateDiscount(result.coupon, orderTotal);
          setDiscountValue(discount);
          setError(null);
          
          // Atualizar contexto global
          setGlobalCoupon(result.coupon);
          setGlobalDiscount(discount);
          
          console.log("✅ [CUPOM] Aplicado com sucesso:", {
            coupon: result.coupon.code,
            discount,
            orderTotal
          });
        } else {
          setAppliedCoupon(null);
          setDiscountValue(0);
          setError(result.error || "Cupom inválido");
          clearCoupon();
          
          console.log("❌ [CUPOM] Inválido:", result.error);
        }
      })
      .catch(() => {
        setAppliedCoupon(null);
        setDiscountValue(0);
        setError("Erro ao validar cupom");
        clearCoupon();
      })
      .finally(() => setLoading(false));
  }, [couponCode, orderTotal, setGlobalCoupon, setGlobalDiscount, clearCoupon]);

  useEffect(() => {
    validate();
  }, [couponCode, orderTotal, validate]);

  return { loading, error, appliedCoupon, discountValue, validate };
} 