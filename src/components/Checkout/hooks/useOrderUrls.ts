import { useEffect, useState } from "react";
import { getCartCheckoutResumeByUser, CartCheckoutResume } from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";
import { supabase } from "../../../lib/supabase";

export interface OrderItemInfo {
  url: string;
  total: number;
}

export function useOrderUrls() {
  const [items, setItems] = useState<OrderItemInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setItems([]);
          setLoading(false);
          return;
        }
        const cartItems = await getCartCheckoutResumeByUser(user.id);
        if (cartItems && cartItems.length > 0) {
          const itemsList = cartItems
            .filter((item: CartCheckoutResume) => !!item.product_url)
            .map((item: CartCheckoutResume) => ({
              url: item.product_url!,
              total: item.item_total ?? 0
            }));
          setItems(itemsList);
        } else {
          setItems([]);
        }
      } catch (err) {
        setError("Erro ao buscar itens do pedido");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  return { items, loading, error };
} 