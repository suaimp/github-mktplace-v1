import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOrderTotalsByUser } from "../../context/db-context/services/OrderTotalsService";

export default function FinishOrder() {
  const [totalProductPrice, setTotalProductPrice] = useState<number | null>(
    null
  );
  const [totalContentPrice, setTotalContentPrice] = useState<number | null>(
    null
  );
  const [totalFinalPrice, setTotalFinalPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchTotal() {
      try {
        setLoading(true);
        setError(null);

        // Obter usuário autenticado diretamente do Supabase
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        if (userError) {
          setError("Erro ao verificar usuário logado");
          return;
        }

        if (!user) {
          setError("Usuário não está logado");
          return;
        } // Usar o serviço OrderTotalsService para buscar os totais
        const orderTotals = await getOrderTotalsByUser(user.id);

        if (orderTotals && orderTotals.length > 0) {
          const latestTotal = orderTotals[0]; // Verificar se o user_id do registro corresponde ao usuário logado
          if (latestTotal.user_id === user.id) {
            const productPrice = Number(latestTotal.total_product_price) || 0;
            const contentPrice = Number(latestTotal.total_content_price) || 0;
            const finalPrice = Number(latestTotal.total_final_price) || 0;
            setTotalProductPrice(productPrice);
            setTotalContentPrice(contentPrice);
            setTotalFinalPrice(finalPrice);
          } else {
            setTotalProductPrice(0);
            setTotalContentPrice(0);
            setTotalFinalPrice(0);
          }
        } else {
          setTotalProductPrice(0);
          setTotalContentPrice(0);
          setTotalFinalPrice(0);
        }
      } catch (err) {
        setError("Erro ao carregar totais do pedido");
        setTotalProductPrice(0);
        setTotalContentPrice(0);
        setTotalFinalPrice(0);
      } finally {
        setLoading(false);
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
  // Usar o total_final_price do banco de dados
  const total = totalFinalPrice ?? 0;

  const handleGoToPayment = () => {
    navigate("/checkout/payment");
  };
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 sticky top-24">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Resumo do pedido
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <div className="py-2"></div>
      <div className="my-2 border-t border-b border-t-gray-300 border-b-gray-300 dark:border-t-gray-700 dark:border-b-gray-700 py-5">
        <div className="flex items-center justify-between">
          <div className="text-gray-700 dark:text-gray-300">Valor</div>
          <div className="text-gray-900 dark:text-white">
            {loading ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
            ) : (
              <>
                R$&nbsp;
                {totalProductPrice !== null
                  ? totalProductPrice.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2
                    })
                  : "0,00"}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-700 dark:text-gray-300">Conteúdo</div>
          <div className="text-gray-900 dark:text-white">
            {loading ? (
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
            ) : (
              <>
                R$&nbsp;
                {totalContentPrice !== null
                  ? totalContentPrice.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2
                    })
                  : "0,00"}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-800 dark:text-white">Total</div>
        <div>
          {loading ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-5 w-20 rounded"></div>
          ) : (
            <span className="text-gray-900 dark:text-white font-bold">
              R$&nbsp;
              {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
      {/* Botão só aparece se não estiver na rota de pagamento */}
      {window.location.pathname !== "/checkout/payment" && (
        <button
          className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded transition-colors"
          type="button"
          onClick={handleGoToPayment}
        >
          Ir para pagamento
        </button>
      )}
    </div>
  );
}
