/**
 * Exemplo de migração: FinishOrder.tsx usando sistema híbrido
 * Responsabilidade única: Demonstrar migração gradual do sistema antigo para o modular
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getOrderTotalsByUser } from "../../services/db-services/marketplace-services/order/OrderTotalsService";
import { useCouponInput } from "./utils/coupon/useCouponInput";
import { useCouponDiscount } from "./utils/coupon/useCouponDiscount";
import { formatCurrency } from "../../utils/currency";
import { useCheckoutTotal } from "./hooks/useCheckoutTotal";

// Importações do sistema antigo e novo para comparação
import { useCheckoutValidation } from "./hooks/useCheckoutValidation";
import { 
  useModularCheckoutValidation, 
  ValidationMigrationUtils 
} from "./validation";

export default function FinishOrderMigration() {
  const [totalProductPrice, setTotalProductPrice] = useState<number | null>(null);
  const [totalContentPrice, setTotalContentPrice] = useState<number | null>(null);
  const [totalFinalPrice, setTotalFinalPrice] = useState<number | null>(null);
  const [dbDiscountValue, setDbDiscountValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { couponValue, handleCouponChange } = useCouponInput();
  const [couponInput, setCouponInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { total: checkoutTotal, loading: loadingCheckoutTotal } = useCheckoutTotal();

  // MODO COMPARAÇÃO: Usar ambos os sistemas temporariamente
  const legacyValidation = useCheckoutValidation();
  const modularValidation = useModularCheckoutValidation({
    enableLogging: true,
    logDetails: true,
    requireNiche: true,
    requireService: true
  });

  // Comparar resultados para garantir que a migração está funcionando
  useEffect(() => {
    ValidationMigrationUtils.compareValidationResults(
      legacyValidation,
      modularValidation
    );
  }, [legacyValidation.areAllFieldsSelected, modularValidation.areAllFieldsSelected]);

  // Usar o sistema modular como principal, mas com fallback para o antigo se necessário
  const areAllFieldsSelected = modularValidation.areAllFieldsSelected;
  const loadingValidation = modularValidation.loading;

  // Detectar se está na página de pagamento
  const isPaymentPage = location.pathname === "/checkout/payment";

  useEffect(() => {
    async function fetchTotal() {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        if (userError) {
          console.error("Erro ao verificar usuário logado:", userError);
          return;
        }

        if (!user) {
          console.error("Usuário não está logado");
          return;
        }
        
        const orderTotals = await getOrderTotalsByUser(user.id);

        if (orderTotals && orderTotals.length > 0) {
          const latestTotal = orderTotals[0];
          if (latestTotal.user_id === user.id) {
            const productPrice = Number(latestTotal.total_product_price) || 0;
            const contentPrice = Number(latestTotal.total_content_price) || 0;
            const finalPrice = Number(latestTotal.total_final_price) || 0;
            const discount = Number(latestTotal.discount_value) || 0;
            
            setTotalProductPrice(productPrice);
            setTotalContentPrice(contentPrice);
            setTotalFinalPrice(finalPrice);
            setDbDiscountValue(discount);
          } else {
            setTotalProductPrice(0);
            setTotalContentPrice(0);
            setTotalFinalPrice(0);
            setDbDiscountValue(0);
          }
        } else {
          setTotalProductPrice(0);
          setTotalContentPrice(0);
          setTotalFinalPrice(0);
          setDbDiscountValue(0);
        }
      } catch (err) {
        console.error("Erro ao carregar totais do pedido:", err);
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

  const {
    loading: couponLoading,
    error: couponError,
    appliedCoupon,
    discountValue
  } = useCouponDiscount(couponValue, checkoutTotal);

  const handleGoToPayment = async () => {
    if (!areAllFieldsSelected) {
      console.warn("Selecione o tipo de conteúdo e pacote de conteúdo para todos os itens antes de prosseguir");
      return;
    }

    try {
      setLoading(true);
      
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Usuário não autenticado:", userError);
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/checkout/payment");
    } catch (err) {
      console.error("Erro ao prosseguir para pagamento:", err);
      setLoading(false);
    }
  };

  const handleApplyCoupon = () => {
    handleCouponChange({ target: { value: couponInput } } as any);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Resumo do pedido (Sistema Modular)
      </h3>

      {/* Badge de modo de migração */}
      <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span className="text-blue-800 dark:text-blue-200">
            Modo Migração: Sistema Modular Ativo
          </span>
          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
            Legacy: {legacyValidation.areAllFieldsSelected ? '✓' : '✗'} | 
            Modular: {modularValidation.areAllFieldsSelected ? '✓' : '✗'}
          </span>
        </div>
      </div>
      
      {/* Input de cupom de desconto */}
      {window.location.pathname === "/checkout" && (
        <div className="mb-4 flex flex-col items-start gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Cupom de desconto
          </label>
          <div className="andes-form-control__control" style={{ width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyCoupon();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
              placeholder="Digite o código do cupom"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white text-sm font-medium rounded-r-md transition-colors disabled:cursor-not-allowed"
            >
              {couponLoading ? "..." : "Aplicar"}
            </button>
          </div>
          
          {couponError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {couponError}
            </p>
          )}
          
          {appliedCoupon && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Cupom "{appliedCoupon.code}" aplicado! Desconto: {formatCurrency(discountValue)}
            </p>
          )}
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
                  
                  {/* Informações de debug do sistema modular */}
                  {modularValidation.validationDetails && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                        Detalhes da Validação Modular
                      </summary>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        <p>Status: {modularValidation.validationDetails.isValid ? 'Válido' : 'Inválido'}</p>
                        {modularValidation.validationDetails.errors && modularValidation.validationDetails.errors.length > 0 && (
                          <div>
                            <p>Erros:</p>
                            <ul className="list-disc list-inside ml-2">
                              {modularValidation.validationDetails.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
