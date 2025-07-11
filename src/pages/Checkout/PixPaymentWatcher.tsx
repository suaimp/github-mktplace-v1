import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface PixPaymentWatcherProps {
  orderId: string;
  onPixPaid: () => void;
}

// Status considerados como pagamento aprovado
const PAID_STATUSES = ["paid", "approved", "succeeded"];

export default function PixPaymentWatcher({ orderId, onPixPaid }: PixPaymentWatcherProps) {
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    finishedRef.current = false;

    async function checkPixStatus() {
      // Buscar status do pedido no Supabase
      const { data, error } = await supabase
        .from("orders")
        .select("id, payment_status, payment_method")
        .eq("id", orderId)
        .maybeSingle();
      if (error) {
        console.error("Erro ao buscar status do pedido PIX:", error);
        return;
      }
      if (data && PAID_STATUSES.includes(data.payment_status)) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          onPixPaid();
          // Removido: navigate('/checkout/success')
        }
      }
    }

    // Polling a cada 5 segundos
    intervalRef.current = setInterval(checkPixStatus, 5000);
    // Checar imediatamente ao montar
    checkPixStatus();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      finishedRef.current = true;
    };
  }, [orderId, onPixPaid, navigate]);

  return null;
} 