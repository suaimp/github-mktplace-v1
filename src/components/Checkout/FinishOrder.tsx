import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOrderTotalsByUser } from "../../services/db-services/marketplace-services/order/OrderTotalsService";
import { getCartCheckoutResumeByUser, CartCheckoutResume } from "../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";
import { useCouponInput } from "./utils/coupon/useCouponInput";
import { useCouponDiscount } from "./utils/coupon/useCouponDiscount";
import { formatCurrency } from "../../utils/currency";
import { useCheckoutValidation } from "./hooks/useCheckoutValidation";
 
import { useCheckoutTotal } from "./hooks/useCheckoutTotal";

export default function FinishOrder() {
  const [totalProductPrice, setTotalProductPrice] = useState<number | null>(
    null
  );
  const [totalContentPrice, setTotalContentPrice] = useState<number | null>(
    null
  );
  //@ts-ignore
  const [totalFinalPrice, setTotalFinalPrice] = useState<number | null>(null);
  //@ts-ignore
  const [dbAppliedCouponId, setDbAppliedCouponId] = useState<string | null>(null);
  const [dbDiscountValue, setDbDiscountValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { couponValue, handleCouponChange } = useCouponInput();
  const [couponInput, setCouponInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // Substituir totalFinalPrice pelo valor do hook
  const { total: checkoutTotal, loading: loadingCheckoutTotal } = useCheckoutTotal();
  // Estado para lista de itens do banco (cart_checkout_resume)
  const [checkoutItems, setCheckoutItems] = useState<CartCheckoutResume[]>([]);
  const [loadingCheckoutItems, setLoadingCheckoutItems] = useState(true);

  const { areAllFieldsSelected, loading: loadingValidation } = useCheckoutValidation();

  // Log para debug do estado do botão
  console.log('[FinishOrder] Estado do botão:', {
    areAllFieldsSelected,
    loadingValidation,
    shouldBeDisabled: !areAllFieldsSelected || loadingValidation
  });

  // Detectar se está na página de pagamento
  const isPaymentPage = location.pathname === "/checkout/payment";

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
            const couponId = latestTotal.applied_coupon_id || null;
            const discount = Number(latestTotal.discount_value) || 0;
            
            setTotalProductPrice(productPrice);
            setTotalContentPrice(contentPrice);
            setTotalFinalPrice(finalPrice);
            setDbAppliedCouponId(couponId);
            setDbDiscountValue(discount);
          } else {
            setTotalProductPrice(0);
            setTotalContentPrice(0);
            setTotalFinalPrice(0);
            setDbAppliedCouponId(null);
            setDbDiscountValue(0);
          }
        } else {
          setTotalProductPrice(0);
          setTotalContentPrice(0);
          setTotalFinalPrice(0);
          setDbAppliedCouponId(null);
          setDbDiscountValue(0);
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
    async function fetchCheckoutItems() {
      setLoadingCheckoutItems(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckoutItems([]);
        setLoadingCheckoutItems(false);
        return;
      }
      const items = await getCartCheckoutResumeByUser(user.id);
      setCheckoutItems(items || []);
      setLoadingCheckoutItems(false);
    }
    fetchCheckoutItems();
  }, []);

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
  // Usar checkoutTotal como base do desconto
  const {
    loading: couponLoading,
    error: couponError,
    appliedCoupon,
    discountValue
  } = useCouponDiscount(couponValue, checkoutTotal);
  // Usar checkoutTotal como base do total exibido
 

  const handleGoToPayment = async () => {
    // Verificar se todos os campos estão selecionados antes de prosseguir
    if (!areAllFieldsSelected) {
      setError("Selecione o tipo de conteúdo e pacote de conteúdo para todos os itens antes de prosseguir");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      // Os totais com desconto já estão sendo salvos automaticamente pelo contexto de cupom
      // Apenas navegar para a página de pagamento
      setLoading(false);
      navigate("/checkout/payment");
    } catch (err) {
      setError("Erro ao prosseguir para pagamento");
      setLoading(false);
    }
  };
  // Novo handler para aplicar cupom
  const handleApplyCoupon = () => {
    handleCouponChange({ target: { value: couponInput } } as any);
    // Opcional: dar foco no input após aplicar
    inputRef.current?.focus();
  };
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Resumo do pedido
      </h3>
      {/* Input de cupom de desconto */}
      {window.location.pathname === "/checkout" && (
        <div className="mb-4 flex flex-col items-start gap-2">
          <label htmlFor="inputcode-textfield-with-link" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Cupom de desconto
          </label>
          <div className="andes-form-control__control" style={{ width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center' }}>
            <input
              autoComplete="off"
              id="inputcode-textfield-with-link"
              className="flex-grow rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
              maxLength={23}
              placeholder="Inserir código do cupom"
              aria-label="Inserir código do cupom"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value)}
              style={{ minWidth: 0 }}
              ref={inputRef}
            />
            <div style={{ marginLeft: 8 }}>
              <button
                type="button"
                className="bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-4 rounded transition-colors"
                onClick={handleApplyCoupon}
              >
                Adicionar
              </button>
            </div>
          </div>
          {couponLoading && <span className="text-xs text-gray-500">Validando cupom...</span>}
          {couponError && <span className="text-xs text-red-500">{couponError}</span>}
          {appliedCoupon && (
            <span className="text-xs text-green-600">Cupom aplicado: {appliedCoupon.code} - {appliedCoupon.name}</span>
          )}
        </div>
      )}
      {/* Lista de Itens do pedido */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-700 dark:text-gray-200 mb-1">Itens:</h4>
        {loadingCheckoutItems ? (
          <span className="text-xs text-gray-500">Carregando itens...</span>
        ) : checkoutItems.length === 0 ? (
          <span className="text-xs text-gray-400">Nenhum item encontrado.</span>
        ) : (
          <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-200">
            {checkoutItems.map((item, idx) => (
              <li key={idx} className="break-all flex items-center">
                <span>{item.product_url}</span>
              </li>
            ))}
          </ul>
        )}
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
        {/* Exibir desconto se houver */}
        {(isPaymentPage ? dbDiscountValue > 0 : discountValue > 0) && (
          <div className="flex items-center justify-between mt-2">
            <div className="text-gray-700 dark:text-gray-300">Desconto</div>
            <div className="text-green-600 dark:text-green-400">
              - {formatCurrency(isPaymentPage ? dbDiscountValue : discountValue)}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-800 dark:text-white">Total</div>
        <div>
          {loading || loadingCheckoutTotal ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-5 w-20 rounded"></div>
          ) : (
            <span className="text-gray-900 dark:text-white font-bold">
              {isPaymentPage 
                ? formatCurrency(totalFinalPrice || 0)
                : formatCurrency(Math.max((checkoutTotal - discountValue), 0))
              }
            </span>
          )}
        </div>
      </div>
      {/* Botão só aparece se não estiver na rota de pagamento */}
      {window.location.pathname !== "/checkout/payment" && (
        <div>
          <button
            className={`w-full mt-2 font-medium py-2 px-4 rounded transition-colors ${
              areAllFieldsSelected && !loadingValidation
                ? "bg-brand-500 hover:bg-brand-600 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
            type="button"
            onClick={handleGoToPayment}
            disabled={!areAllFieldsSelected || loadingValidation}
            title={!areAllFieldsSelected ? "Selecione o tipo de conteúdo e pacote de conteúdo para todos os itens antes de prosseguir" : ""}
          >
            {loadingValidation ? "Verificando..." : "Ir para pagamento"}
          </button>
          {!areAllFieldsSelected && !loadingValidation && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Confirme o Nicho e Conteúdo</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">Por favor, selecione o tipo de conteúdo e Pacote de Conteúdo para cada item antes de continuar.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
