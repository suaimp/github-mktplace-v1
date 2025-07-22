import { useEffect } from "react";
import { useCouponContext } from "./useCouponContext";
import { calculateTotal } from "../utils/calculateTotal";

/**
 * Hook que observa mudanças no cupom aplicado e recalcula os totais
 */
export function useCouponTotalCalculation(
  totalFinalArray: any[],
  totalProductArray?: any[],
  totalContentArray?: any[],
  totalWordCountArray?: any[]
) {
  const { appliedCoupon, discountValue } = useCouponContext();

  useEffect(() => {
    if (!totalFinalArray || totalFinalArray.length === 0) return;

    console.log("🧮 [CUPOM CALCULATION] Recalculando totais:", {
      totalFinalArray,
      discountValue,
      appliedCoupon: appliedCoupon?.code || null
    });

    // Recalcular totais quando cupom ou arrays mudarem
    calculateTotal(
      totalFinalArray,
      totalProductArray,
      totalContentArray,
      totalWordCountArray,
      discountValue,
      appliedCoupon?.id || null
    ).catch((error) => {
      console.error("Erro ao recalcular totais com cupom:", error);
    });
  }, [
    totalFinalArray,
    totalProductArray,
    totalContentArray,
    totalWordCountArray,
    discountValue,
    appliedCoupon?.id
  ]);
}
