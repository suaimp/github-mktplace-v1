import { useState, ChangeEvent } from "react";

export function useCouponInput() {
  const [couponValue, setCouponValue] = useState("");

  function handleCouponChange(e: ChangeEvent<HTMLInputElement>) {
    setCouponValue(e.target.value);
    console.log("Cupom digitado:", e.target.value);
  }

  return { couponValue, handleCouponChange };
} 