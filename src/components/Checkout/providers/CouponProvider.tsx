import { useState, ReactNode } from "react";
import { Coupon } from "../../../pages/Coupons/types";
import { CouponContext } from "../hooks/useCouponContext";

interface CouponProviderProps {
  children: ReactNode;
}

export function CouponProvider({ children }: CouponProviderProps) {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setDiscountValue(0);
  };

  return (
    <CouponContext.Provider
      value={{
        appliedCoupon,
        discountValue,
        setAppliedCoupon,
        setDiscountValue,
        clearCoupon,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}
