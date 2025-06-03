import { useEffect, useState } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchTotal() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      const totals = await getOrderTotalsByUser(user.id);
      if (totals && totals.length > 0) {
        setTotalProductPrice(Number(totals[0].total_product_price));
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
  const serviceFee = 0;
  const total = (totalProductPrice ?? 0) + serviceFee;

  return (
    <div
      className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white px-4 py-5 sm:px-6 flex flex-col relative"
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
        <h3 className="flex items-center text-base font-medium text-gray-900">
          Resumo do Pedido
        </h3>
      </div>

      <div className="py-2"></div>
      <div className="flex items-center justify-between">
        <div className="font-bold">2 x links</div>
        <div className="text-gray-800">R$&nbsp;1.035</div>
      </div>
      <ul className="space-y-3 py-3 text-gray-500">
        <li className="flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Link do-follow</span>
        </li>
      </ul>
      <div className="my-2 border-t border-b border-t-gray-300 border-b-gray-300 py-5">
        <div className="flex items-center justify-between">
          <div>Valor</div>
          <div>
            R$&nbsp;
            {totalProductPrice !== null
              ? totalProductPrice.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2
                })
              : "-"}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>Taxa de serviço</div>
          <div>R$&nbsp;0</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="font-medium">Total</div>
        <div>
          <span className="text-gray-900 font-bold">
            R$&nbsp;
            {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <button
        className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded transition-colors"
        type="button"
      >
        Ir para pagamento
      </button>
    </div>
  );
}
