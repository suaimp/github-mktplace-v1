import { useState, useEffect, useCallback } from "react";
import { validateCoupon, calculateDiscount } from "../../../../services/db-services/coupons/couponService";
import { Coupon } from "../../../../pages/Coupons/types";

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

  const validate = useCallback(() => {
    if (!couponCode || !orderTotal) {
      setAppliedCoupon(null);
      setDiscountValue(0);
      setError(null);
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
        } else {
          setAppliedCoupon(null);
          setDiscountValue(0);
          setError(result.error || "Cupom inválido");
        }
      })
      .catch(() => {
        setAppliedCoupon(null);
        setDiscountValue(0);
        setError("Erro ao validar cupom");
      })
      .finally(() => setLoading(false));
  }, [couponCode, orderTotal]);

  useEffect(() => {
    validate();
  }, [couponCode, orderTotal, validate]);

  return { loading, error, appliedCoupon, discountValue, validate };
} 