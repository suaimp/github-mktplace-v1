import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderTotalsByUser } from "../../context/db-context/services/OrderTotalsService";
import { supabase } from "../../lib/supabase";

interface CheckoutFormProps {
  formData: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    paymentMethod: string;
  };
  loading: boolean;
  totalPrice: number;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function CheckoutForm({}: CheckoutFormProps) {
  const [totalProductPrice, setTotalProductPrice] = useState<number | null>(
    null
  );
  const [totalContentPrice, setTotalContentPrice] = useState<number | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTotal() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      const totals = await getOrderTotalsByUser(user.id);
      if (totals && totals.length > 0) {
        setTotalProductPrice(Number(totals[0].total_product_price));
        setTotalContentPrice(Number(totals[0].total_content_price ?? 0));
      }
    }
    fetchTotal();
  }, [refreshKey]);

  useEffect(() => {
    // Listener para eventos de atualização do order_totals
    function handleOrderTotalUpdated() {
      setRefreshKey((k) => k + 1);
    }
    window.addEventListener("order-totals-updated", handleOrderTotalUpdated);
    return () =>
      window.removeEventListener(
        "order-totals-updated",
        handleOrderTotalUpdated
      );
  }, []);

  // Defina a taxa de serviço (pode ser dinâmica se desejar)
  const total = (totalProductPrice ?? 0) + (totalContentPrice ?? 0);

  const handleGoToPayment = () => {
    navigate("/checkout/payment");
  };

  return (
    <div
      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 flex flex-col relative shadow-md dark:shadow-lg"
      style={{
        position: "fixed",
        top: "235px",
        right: "32px",
        maxWidth: "420px",
        zIndex: 50,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        height: "auto",
        maxHeight: "calc(100vh - 64px)",
        overflowY: "auto"
      }}
    >
      <div className="absolute right-1 top-2.5"></div>
      <div className="mb-3">
        <h3 className="flex items-center text-base font-medium text-gray-900 dark:text-white">
          Resumo do Pedido
        </h3>
      </div>

      <div className="py-2"></div>
      <div className="my-2 border-t border-b border-t-gray-300 border-b-gray-300 dark:border-t-gray-700 dark:border-b-gray-700 py-5">
        <div className="flex items-center justify-between">
          <div className="text-gray-700 dark:text-gray-300">Valor</div>
          <div className="text-gray-900 dark:text-white">
            R$&nbsp;
            {totalProductPrice !== null
              ? totalProductPrice.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2
                })
              : "-"}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-700 dark:text-gray-300">Conteúdo</div>
          <div className="text-gray-900 dark:text-white">
            R$&nbsp;
            {totalContentPrice !== null
              ? totalContentPrice.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2
                })
              : "-"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-800 dark:text-white">Total</div>
        <div>
          <span className="text-gray-900 dark:text-white font-bold">
            R$&nbsp;
            {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <button
        className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded transition-colors"
        type="button"
        onClick={handleGoToPayment}
      >
        Ir para pagamento
      </button>
    </div>
  );
}