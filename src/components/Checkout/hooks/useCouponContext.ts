import { createContext, useContext } from "react";
import { Coupon } from "../../../pages/Coupons/types";

interface CouponContextType {
  appliedCoupon: Coupon | null;
  discountValue: number;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  setDiscountValue: (value: number) => void;
  clearCoupon: () => void;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export function useCouponContext() {
  const context = useContext(CouponContext);
  if (!context) {
    // Retornar valores padrão se o contexto não estiver disponível
    return {
      appliedCoupon: null,
      discountValue: 0,
      setAppliedCoupon: () => {},
      setDiscountValue: () => {},
      clearCoupon: () => {},
    };
  }
  return context;
}

export { CouponContext };
