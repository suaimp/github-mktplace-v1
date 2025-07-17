import { Coupon } from "../types";

export function updateCouponStatus(
  coupons: Coupon[],
  id: string,
  isActive: boolean
): Coupon[] {
  return coupons.map((coupon) =>
    coupon.id === id ? { ...coupon, is_active: isActive } : coupon
  );
} 