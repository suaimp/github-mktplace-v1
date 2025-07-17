import { createContext, useContext } from "react";

interface CouponsContextProps {
  fetchCoupons: () => void;
}

export const CouponsContext = createContext<CouponsContextProps>({
  fetchCoupons: () => {}
});

export const useCoupons = () => useContext(CouponsContext);
