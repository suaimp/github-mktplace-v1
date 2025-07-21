import { useEffect, useState } from "react";
import { getCartCheckoutResumeByUser } from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";
import { supabase } from "../../../lib/supabase";

export function useCheckoutTotal() {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTotal() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setTotal(0);
          setLoading(false);
          return;
        }
        const items = await getCartCheckoutResumeByUser(user.id);
        if (items && items.length > 0) {
          const sum = items.reduce((acc, item) => acc + (item.item_total ?? 0), 0);
          setTotal(sum);
        } else {
          setTotal(0);
        }
      } catch (err) {
        setError("Erro ao buscar total do checkout");
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    fetchTotal();
    // Atualiza quando houver evento de alteração
    function handleUpdate() {
      fetchTotal();
    }
    window.addEventListener("resume-table-reload", handleUpdate);
    window.addEventListener("order-totals-updated", handleUpdate);
    return () => {
      window.removeEventListener("resume-table-reload", handleUpdate);
      window.removeEventListener("order-totals-updated", handleUpdate);
    };
  }, []);

  return { total, loading, error };
} 