import { useEffect } from "react";
import { useCheckoutCardsActions } from "../../ServicePackages/cards/checkoutCardsActions";

export function useServiceCardActions() {
  const { getActiveCards, serviceCardsByActiveService } =
    useCheckoutCardsActions();

  useEffect(() => {
    getActiveCards();
    // eslint-disable-next-line
  }, []);

  return { getActiveCards, serviceCardsByActiveService };
}
