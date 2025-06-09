import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOrderTotalsByUser } from "../../context/db-context/services/OrderTotalsService";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchTotal() {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 FinishOrder: Iniciando busca de totais...");

        // Obter usuário autenticado diretamente do Supabase
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ FinishOrder: Erro ao buscar usuário:", userError);
          setError("Erro ao verificar usuário logado");
          return;
        }

        if (!user) {
          console.warn("⚠️ FinishOrder: Usuário não está logado");
          setError("Usuário não está logado");
          return;
        }
        console.log("👤 FinishOrder: Usuário logado:", {
          id: user.id,
          email: user.email
        });

        // Usar o serviço OrderTotalsService para buscar os totais
        console.log("📊 FinishOrder: Buscando totais via serviço...");
        const orderTotals = await getOrderTotalsByUser(user.id);

        console.log("📊 FinishOrder: Resultado do serviço:", {
          userId: user.id,
          results: orderTotals
        });

        if (orderTotals && orderTotals.length > 0) {
          const latestTotal = orderTotals[0];
          console.log("✅ FinishOrder: Total encontrado:", latestTotal);

          // Verificar se o user_id do registro corresponde ao usuário logado
          if (latestTotal.user_id === user.id) {
            const productPrice = Number(latestTotal.total_product_price) || 0;
            const contentPrice = Number(latestTotal.total_content_price) || 0;

            setTotalProductPrice(productPrice);
            setTotalContentPrice(contentPrice);

            console.log("💰 FinishOrder: Valores definidos:", {
              totalProductPrice: productPrice,
              totalContentPrice: contentPrice,
              total: productPrice + contentPrice
            });
          } else {
            console.error(
              "❌ FinishOrder: user_id do registro não corresponde ao usuário logado!",
              {
                recordUserId: latestTotal.user_id,
                loggedUserId: user.id
              }
            );
            setTotalProductPrice(0);
            setTotalContentPrice(0);
          }
        } else {
          console.log("📭 FinishOrder: Nenhum total encontrado para o usuário");
          setTotalProductPrice(0);
          setTotalContentPrice(0);
        }
      } catch (err) {
        console.error("💥 FinishOrder: Erro inesperado ao buscar totais:", err);
        setError("Erro ao carregar totais do pedido");
        setTotalProductPrice(0);
        setTotalContentPrice(0);
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
      <div className="absolute right-1 top-2.5"></div>{" "}
      <div className="mb-3">
        <h3 className="flex items-center text-base font-medium text-gray-900 dark:text-white">
          Resumo do Pedido
        </h3>
      </div>
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
