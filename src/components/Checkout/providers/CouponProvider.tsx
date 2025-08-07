import { useState, ReactNode, useCallback, useMemo } from "react";
import { Coupon } from "../../../pages/Coupons/types";
import { CouponContext } from "../hooks/useCouponContext";

interface CouponProviderProps {
  children: ReactNode;
}

export function CouponProvider({ children }: CouponProviderProps) {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);

  const clearCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountValue(0);
  }, []);

  const contextValue = useMemo(() => ({
    appliedCoupon,
    discountValue,
    setAppliedCoupon,
    setDiscountValue,
    clearCoupon,
  }), [appliedCoupon, discountValue, clearCoupon]);

  return (
    <CouponContext.Provider value={contextValue}>
      {children}
    </CouponContext.Provider>
  );
}
