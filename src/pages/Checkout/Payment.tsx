import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { loadStripe } from "@stripe/stripe-js"; // [PAUSADO] Stripe temporariamente desativado
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { supabase } from "../../lib/supabase";
import { CouponProvider } from "../../components/Checkout/providers/CouponProvider";
import PaymentInformationForm from "../../components/Checkout/PaymentInformationForm";
import PaymentMethodForm from "../../components/Checkout/PaymentMethodForm";
import FinishOrder from "../../components/Checkout/FinishOrder";
import OrderProgress from "../Orders/local-components/OrderProgress";
import { createOrder } from "../../services/db-services/marketplace-services/order/OrderService";
import { sanitizeErrorMessage } from "../../utils/errorSanitizer";
import { formatCurrency } from "../../components/marketplace/utils";
// import { validatePhone } from "../../utils/phoneValidation"; // [PAUSADO] Temporariamente comentado
import { OrderItemService } from "../../services/db-services/marketplace-services/order/OrderItemService";
import PixPaymentWatcher from "./PixPaymentWatcher";
import { v4 as uuidv4 } from 'uuid';
import { useCustomSticky } from "../../hooks/useCustomSticky";
import { InstallmentOption } from "../../components/Checkout/PaymentInformationForm/Installments/types";
// Novo import para PIX modular
import { usePixPaymentModular } from "./Payment/pix/hooks/usePixPayment";
// Removed unused imports - using direct payment now

// Mock function to simulate payment processing
// @ts-ignore
const processPayment = async (paymentMethod: string) => {
  // In a real app, this would call your backend to process the payment
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(`payment_${Date.now()}`);
    }, 1500);
  });
};

// Função utilitária para extrair benefits corretamente
function extrairBenefits(service_content: any) {
  let obj = service_content;
  if (Array.isArray(obj) && obj.length > 0) {
    if (typeof obj[0] === "string") {
      try {
        obj = JSON.parse(obj[0]);
      } catch {
        obj = {};
      }
    } else if (typeof obj[0] === "object") {
      obj = obj[0];
    }
  } else if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      obj = {};
    }
  }
  return obj?.benefits;
}

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [processing, setProcessing] = useState(false);
  // const [stripePromise, setStripePromise] = useState<any>(null); // [PAUSADO] Stripe temporariamente desativado
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    documentNumber: "",
    phone: "",
    legal_status: 'individual' as 'individual' | 'business', // Corrigido para tipo literal
    country: "BR",
    company_name: "",
    neighborhood: "",
    street: "",
    streetNumber: ""
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    items: [] as any[],
    totalProductPrice: 0,
    totalContentPrice: 0,
    totalFinalPrice: 0,
    appliedCouponId: null as string | null,
    discountValue: 0,
  });
  
  // PIX Modular Hook - substitui pixQrCodeUrl e pixCopiaECola
  const {
    pixQrCodeUrl,
    pixCopiaECola,
 
 
    generatePixQrCode: generatePixQrCodeModular,
    clearPixData,
     
  } = usePixPaymentModular();
  
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    string[]
  >(["card", "pix", "boleto"]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [conteudoCliente, setConteudoCliente] = useState<any[]>([]);
  const [outrosProdutos, setOutrosProdutos] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardholderName: "",
    country: "BR"
  });
  const [idempotencyKey] = useState(() => uuidv4());
  // [1] Adicione o estado para armazenar o número de parcelas selecionado
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1);
  const [installmentsOptions, setInstallmentsOptions] = useState<InstallmentOption[]>([]);

  // Estados de validação individuais para cada formulário
  const [isPaymentInfoFormValid, setIsPaymentInfoFormValid] = useState(false);
  const [isCardFormValid, setIsCardFormValid] = useState(false);

  // Hook para sticky positioning personalizado
  // const { isFixed } = useCustomSticky(); // Não utilizado no momento

  const stickyHook = useCustomSticky({ offsetTop: 20, onlyOnDesktop: true });

  useEffect(() => {
    loadPaymentSettings();
    loadOrderTotal();
    loadCompanyData();
    loadCartItems();
    
    // Aguardar um pouco e recarregar totais novamente para garantir valores atualizados
    const timeoutId = setTimeout(() => {
      console.log("🔄 TIMEOUT: Recarregando order totals após delay");
      loadOrderTotal();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Listener para eventos de atualização do order_totals
  useEffect(() => {
    function handleOrderTotalUpdated() {
      console.log("🔄 EVENT: order-totals-updated received, reloading order total");
      loadOrderTotal();
    }
    window.addEventListener("order-totals-updated", handleOrderTotalUpdated);
    return () =>
      window.removeEventListener("order-totals-updated", handleOrderTotalUpdated);
  }, []);

  useEffect(() => {
    if (success && currentOrderId) {
      setLoadingItems(true);
      OrderItemService.listOrderItemsByOrder(currentOrderId)
        .then((items) => {
          setOrderItems(items || []);
          // Corrigido: extrai benefits corretamente
          const fornecidoPeloCliente = (items || []).filter((item: any) => {
            const benefits = extrairBenefits(item.service_content);
            return (
              benefits === undefined ||
              benefits === null ||
              (Array.isArray(benefits) && benefits.length === 0) ||
              (typeof benefits === "string" && benefits.trim() === "")
            );
          });
          setConteudoCliente(fornecidoPeloCliente);
          setOutrosProdutos(
            (items || []).filter(
              (item: any) => !fornecidoPeloCliente.includes(item)
            )
          );
        })
        .finally(() => setLoadingItems(false));
    }
  }, [success, currentOrderId]);

  async function loadPaymentSettings() {
    try {
      setLoading(true);
      setError("");

      console.log("LOADING PAYMENT SETTINGS:", {
        timestamp: new Date().toISOString(),
        message: "Starting to load payment settings from database",
      });

      // Check if form exists and is published
      const { data, error } = await supabase
        .from("payment_settings")
        .select(
          "stripe_public_key, stripe_enabled, stripe_test_mode, currency, payment_methods"
        )
        .single();

      console.log("PAYMENT SETTINGS DATABASE RESPONSE:", {
        hasData: !!data,
        hasError: !!error,
        stripeEnabled: data?.stripe_enabled,
        hasStripeKey: !!data?.stripe_public_key,
        stripeKeyPrefix: data?.stripe_public_key?.substring(0, 20),
        paymentMethods: data?.payment_methods,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      if (data?.stripe_enabled && data?.stripe_public_key) {
        console.log("INITIALIZING STRIPE:", {
          stripeEnabled: data.stripe_enabled,
          stripeKeyPrefix: data.stripe_public_key.substring(0, 20),
          timestamp: new Date().toISOString(),
        });

        // Initialize Stripe with the public key
        // const stripeInstance = loadStripe(data.stripe_public_key);
        // setStripePromise(stripeInstance);

        console.log("STRIPE INSTANCE CREATED:", {
          stripeInstanceCreated: true,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log("STRIPE NOT INITIALIZED:", {
          stripeEnabled: data?.stripe_enabled,
          hasStripeKey: !!data?.stripe_public_key,
          reason: !data?.stripe_enabled
            ? "Stripe not enabled"
            : "No Stripe public key",
          timestamp: new Date().toISOString(),
        });
      }

      // Set available payment methods from settings
      if (data?.payment_methods && Array.isArray(data.payment_methods) && data.payment_methods.length > 0) {
        // Filter out any invalid payment methods
        const validPaymentMethods = data.payment_methods.filter(method => 
          typeof method === 'string' && ['card', 'pix', 'boleto'].includes(method)
        );
        
        if (validPaymentMethods.length > 0) {
          setAvailablePaymentMethods(validPaymentMethods);
          setPaymentMethod(validPaymentMethods[0]);
          
          console.log("PAYMENT METHODS SET FROM DATABASE:", {
            originalPaymentMethods: data.payment_methods,
            validPaymentMethods: validPaymentMethods,
            defaultMethod: validPaymentMethods[0],
            timestamp: new Date().toISOString(),
          });
        } else {
          // Fallback to default if no valid methods found
          const defaultPaymentMethods = ["card", "pix", "boleto"];
          setAvailablePaymentMethods(defaultPaymentMethods);
          setPaymentMethod(defaultPaymentMethods[0]);
          
          console.log("NO VALID PAYMENT METHODS FROM DATABASE, USING DEFAULT:", {
            originalPaymentMethods: data.payment_methods,
            defaultPaymentMethods: defaultPaymentMethods,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Use default payment methods including PIX if not configured in database
        const defaultPaymentMethods = ["card", "pix", "boleto"];
        setAvailablePaymentMethods(defaultPaymentMethods);
        setPaymentMethod(defaultPaymentMethods[0]);

        console.log("USING DEFAULT PAYMENT METHODS:", {
          hasPaymentMethods: !!data?.payment_methods,
          isArray: Array.isArray(data?.payment_methods),
          paymentMethodsData: data?.payment_methods,
          defaultPaymentMethods: defaultPaymentMethods,
          defaultMethod: defaultPaymentMethods[0],
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error loading payment settings:", error);
      console.log("PAYMENT SETTINGS LOADING ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      setError("Erro ao carregar configurações de pagamento");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrderTotal() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("order_totals")
        .select("total_product_price, total_content_price, total_final_price, applied_coupon_id, discount_value")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Convert to cents for Stripe
        setTotalAmount(Math.round(parseFloat(data.total_final_price) * 100));
        setOrderSummary((prev) => ({
          ...prev,
          totalProductPrice: Number(data.total_product_price),
          totalContentPrice: Number(data.total_content_price),
          totalFinalPrice: Number(data.total_final_price),
          appliedCouponId: data.applied_coupon_id,
          discountValue: Number(data.discount_value) || 0,
        }));
        
        // DEBUG: Log dos valores carregados do banco
        console.log("🔍 ORDER TOTALS LOADED:", {
          totalProductPrice: Number(data.total_product_price),
          totalContentPrice: Number(data.total_content_price),
          totalFinalPrice: Number(data.total_final_price),
          appliedCouponId: data.applied_coupon_id,
          discountValue: Number(data.discount_value) || 0,
          calculatedWithoutDiscount: Number(data.total_product_price) + Number(data.total_content_price),
          timestamp: new Date().toISOString()
        });
      } else {
        console.log("⚠️ No order totals found for user");
      }
    } catch (error) {
      console.error("Error loading order total:", error);
      console.log("ORDER TOTAL LOADING ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async function loadCartItems() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get cart items
      const { data: cartItems, error: cartError } = await supabase
        .from("cart_checkout_resume")
        .select("*")
        .eq("user_id", user.id);

      if (cartError) throw cartError;

      if (cartItems && cartItems.length > 0) {
        setOrderSummary((prev) => ({
          ...prev,
          items: cartItems,
        }));
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
      console.log("CART ITEMS LOADING ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async function loadCompanyData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // First check if user is admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, email, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      if (adminData) {
        // Get company data for admin
        const { data, error } = await supabase
          .from("company_data")
          .select("*")
          .eq("admin_id", user.id)
          .maybeSingle();

        if (error) throw error;

        data;
      } else {
        // Get user data for platform user
        const { data, error } = await supabase
          .from("platform_users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        data;
      }
    } catch (error) {
      console.error("Error loading company data:", error);
      console.log("COMPANY DATA LOADING ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // PROTEÇÃO: Garantir que value nunca seja undefined ou null
    const safeValue = (value !== null && value !== undefined) ? String(value) : "";
    
    console.log("🔄 DEBUG INPUT CHANGE (Payment.tsx):", {
      name: name,
      rawValue: value,
      safeValue: safeValue,
      valueLength: safeValue?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    // Log específico para telefone
    if (name === "phone") {
      console.log("📞 PHONE FIELD CHANGE DETECTED:", {
        rawValue: value,
        safeValue: safeValue,
        valueType: typeof safeValue,
        valueLength: safeValue?.length || 0,
        rawValueJSON: JSON.stringify(value),
        timestamp: new Date().toISOString()
      });
    }
    
    // CORREÇÃO: Usar setFormData diretamente para garantir que o valor seja definido
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: safeValue,
      };
      
      console.log("🔄 FORM DATA UPDATED (Payment.tsx):", {
        field: name,
        oldValue: prev[name as keyof typeof prev],
        newValue: safeValue,
        newFormData: newFormData,
        timestamp: new Date().toISOString()
      });
      
      // Log específico quando telefone é atualizado no formData
      if (name === "phone") {
        console.log("📞 PHONE IN FORM DATA AFTER UPDATE:", {
          phoneValue: newFormData.phone,
          phoneType: typeof newFormData.phone,
          phoneLength: newFormData.phone?.length || 0,
          allFormData: newFormData,
          timestamp: new Date().toISOString()
        });
      }
      if (name === 'legal_status') {
        console.log('[DEBUG Payment.tsx] legal_status atualizado:', newFormData.legal_status);
      }
      
      return newFormData;
    });
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);

    // Clear PIX data when switching methods
    if (method !== "pix") {
      clearPixData(); // Hook modular limpa os dados PIX
    }
    // For PIX, we'll generate QR Code when user fills the form data
  };

  // 1. Função para criar o pedido PIX antes de gerar o QR Code
  async function createPixOrderInDatabase() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Prepare order items
    const orderItems = orderSummary.items.map((item) => {
      let nicheData = item.niche_selected || null;
      if (typeof nicheData === "string") {
        try { nicheData = JSON.parse(nicheData); } catch (e) { nicheData = null; }
      }
      let serviceData = item.service_selected || null;
      if (typeof serviceData === "string") {
        try { serviceData = JSON.parse(serviceData); } catch (e) { serviceData = null; }
      }
      return {
        entry_id: item.entry_id,
        product_name: item.product_url || "Produto",
        product_url: item.product_url,
        quantity: item.quantity || 1,
        unit_price: Number(item.price) || 0,
        total_price: (Number(item.price) || 0) * (item.quantity || 1),
        niche: nicheData,
        service_content: serviceData,
      };
    });
    const totalAmount = orderSummary.totalFinalPrice;
    
    // DEBUG: Log dos valores no momento da criação do pedido PIX
    console.log("🐛 CREATE PIX ORDER - Valores do orderSummary:", {
      totalFinalPrice: orderSummary.totalFinalPrice,
      totalProductPrice: orderSummary.totalProductPrice,
      totalContentPrice: orderSummary.totalContentPrice,
      discountValue: orderSummary.discountValue,
      appliedCouponId: orderSummary.appliedCouponId,
      calculatedWithoutDiscount: orderSummary.totalProductPrice + orderSummary.totalContentPrice,
      timestamp: new Date().toISOString()
    });
    
    const order = await createOrder({
      payment_method: "pix",
      total_amount: totalAmount,
      billing_name: formData.name,
      billing_email: formData.email,
      billing_address: formData.address,
      billing_city: formData.city,
      billing_state: formData.state,
      billing_zip_code: formData.zipCode,
      billing_document_number: formData.documentNumber,
      phone: formData.phone,
      items: orderItems,
      idempotency_key: idempotencyKey, // <--- Envia o idempotency_key
    });
    if (!order) throw new Error("Failed to create order");
    
    // Clear cart after successful PIX order creation (same as credit card flow)
    await clearCart(user.id);
    window.dispatchEvent(new Event("cart-cleared"));
    
    setCurrentOrderId(order.id);
    return order.id;
  }

  const generatePixQrCode = async () => {
    try {
      setProcessing(true);
      
      // VERIFICAÇÃO DE SEGURANÇA - legal_status deve estar definido
      if (!formData.legal_status) {
        console.error("❌ ERRO: legal_status não está definido!");
        setError("Erro: Status legal do cliente não definido. Recarregue a página.");
        return;
      }
      
      // Recarregar totais para garantir dados atualizados
      console.log("🔄 Recarregando totais antes de gerar PIX...");
      await loadOrderTotal();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 1. Criar o pedido no banco (se ainda não existir)
      let orderId = currentOrderId;
      if (!orderId) {
        orderId = await createPixOrderInDatabase();
      }
      
      // 2. Preparar dados do cliente para PIX modular
      const pixCustomerData = {
        name: formData.name,
        email: formData.email,
        document: formData.documentNumber.replace(/\D/g, ""),
        phone: formData.phone.replace(/\D/g, ""),
        legal_status: formData.legal_status,
        company_name: formData.company_name
      };
      
      // 3. Preparar dados do pedido com valores corretos (sem double conversion)
      const pixOrderSummary = {
        totalProductPrice: orderSummary.totalProductPrice,
        totalContentPrice: orderSummary.totalContentPrice, 
        totalFinalPrice: orderSummary.totalFinalPrice,
        items: orderSummary.items || [],
        appliedCouponId: orderSummary.appliedCouponId,
        discountValue: orderSummary.discountValue
      };
      
      console.log("� [PAYMENT.TSX] Chamando PIX modular com dados corretos:", {
        pixCustomerData,
        pixOrderSummary,
        orderId,
        total_final_price_reais: pixOrderSummary.totalFinalPrice,
        total_final_price_cents: pixOrderSummary.totalFinalPrice * 100
      });
      
      // LOG COMPARATIVO: Diferença com implementação anterior
      console.log("🔄 [PAYMENT.TSX] === COMPARAÇÃO COM IMPLEMENTAÇÃO ANTERIOR ===", {
        timestamp: new Date().toISOString(),
        implementacao_anterior: {
          usava_totalAmount_state: "setTotalAmount(Math.round(parseFloat(data.total_final_price) * 100))",
          double_conversion: "totalAmount já em centavos + Math.round(totalToUse * 100)",
          problema: "Double conversion causava valor errado"
        },
        implementacao_modular: {
          usa_orderSummary_direto: "orderSummary.totalFinalPrice (em reais)",
          single_conversion: "convertToCents(totalAmount) apenas no serviço modular",
          solucao: "Conversão única elimina double conversion"
        },
        valores_comparacao: {
          totalAmount_legado_cents: totalAmount,
          totalAmount_legado_reais: totalAmount / 100,
          totalFinalPrice_modular_reais: pixOrderSummary.totalFinalPrice,
          totalFinalPrice_modular_cents: pixOrderSummary.totalFinalPrice * 100,
          diferenca_cents: Math.abs(totalAmount - (pixOrderSummary.totalFinalPrice * 100)),
          problema_resolvido: Math.abs(totalAmount - (pixOrderSummary.totalFinalPrice * 100)) < 1
        }
      });
      
      // 4. Gerar QR Code usando serviço modular (elimina double conversion)
      const result = await generatePixQrCodeModular(
        pixCustomerData,
        pixOrderSummary,
        orderId
      );
      
      // LOG FINAL: Resultado da operação
      console.log("✅ [PAYMENT.TSX] === RESULTADO FINAL ===", {
        timestamp: new Date().toISOString(),
        sucesso: !!result.success,
        tem_qr_code: !!result.qr_code,
        tem_qr_code_url: !!result.qr_code_url,
        erro: result.error || 'nenhum',
        payload_enviado_incluia: {
          valor_total: true,
          dados_cliente: true,
          items_produto: true,
          items_conteudo: pixOrderSummary.totalContentPrice > 0,
          problema_original_resolvido: pixOrderSummary.totalContentPrice > 0 && !!result.success
        }
      });
      
      // 5. Atualizar payment_id no pedido se retornado
      if (result.raw_response?.charges?.[0]?.id) {
        const paymentId = result.raw_response.charges[0].id;
        await updateOrderPaymentId(orderId, paymentId);
      }
      
      console.log("✅ [PAYMENT.TSX] PIX QR Code gerado com sucesso via módulo");
      
    } catch (error: any) {
      console.error("❌ [PAYMENT.TSX] Erro na geração do PIX:", error);
      const sanitizedMessage = sanitizeErrorMessage(
        error.message || "Erro ao gerar QR code PIX"
      );
      setError(sanitizedMessage);
    } finally {
      setProcessing(false);
    }
  };
  // Função específica para sucesso de pagamento PIX (evita duplicação com cartão)
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      setProcessing(true);

      console.log("🎉 PIX PAYMENT SUCCESS - Processando pagamento PIX bem-sucedido:", {
        paymentId: paymentId,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString(),
      }); 
      
      // Para PIX, o pedido já foi criado em createPixOrderInDatabase
      // Apenas atualizar o status e mostrar sucesso
      if (currentOrderId) {
        // Update payment status to "paid" for successful PIX payments
        console.log("💳 Atualizando status do pagamento PIX para 'paid':", {
          orderId: currentOrderId,
          paymentMethod: "pix",
        });

        const { updateOrderStatus } = await import(
          "../../services/db-services/marketplace-services/order/OrderService"
        );
        const updateSuccess = await updateOrderStatus(
          currentOrderId,
          "approved",
          "paid"
        );

        if (updateSuccess) {
          console.log("✅ Status do pagamento PIX atualizado com sucesso para 'paid'");
        } else {
          console.error("❌ Falha ao atualizar status do pagamento PIX");
        }

        // Enviar e-mail de compra para PIX
        try {
          const orderEmailData = {
            name: formData.name,
            email: formData.email,
            total: orderSummary.totalFinalPrice,
            items: orderSummary.items.map((item: any) => {
              // Niche
              let niche = "";
              if (Array.isArray(item.niche_selected) && item.niche_selected.length > 0) {
                try {
                  const parsed = JSON.parse(item.niche_selected[0]);
                  niche = parsed.niche || parsed.title || parsed.name || "";
                } catch {
                  niche = "";
                }
              }
              // Package
              let pacote = "";
              let word_count = "";
              if (Array.isArray(item.service_selected) && item.service_selected.length > 0) {
                try {
                  const parsed = JSON.parse(item.service_selected[0]);
                  pacote = parsed.title || parsed.name || "";
                  word_count = parsed.word_count || "";
                } catch {
                  pacote = "";
                  word_count = "";
                }
              }
              return {
                name: item.product_url || "Produto",
                quantity: item.quantity,
                price: item.price,
                niche,
                package: pacote,
                word_count,
              };
            }),
          };
          const payload = { order: orderEmailData };
          console.log("Dados enviados para função Edge (PIX):", JSON.stringify(payload));
          await fetch(
            "https://uxbeaslwirkepnowydfu.functions.supabase.co/send-order-email",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          console.log("E-mail de notificação de compra enviado para cliente e administrador (PIX)");
        } catch (emailErr) {
          console.error("Erro ao enviar e-mail de compra (PIX):", emailErr);
        }
      }

      // Show success message
      setSuccess(true);
    } catch (error) {
      console.error("Error processing successful PIX payment:", error);
      console.log("PIX PAYMENT SUCCESS PROCESSING ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        paymentId: paymentId,
        timestamp: new Date().toISOString(),
        orderSummary: orderSummary,
        formData: formData,
      });
      setError("Erro ao finalizar o pagamento PIX");
    } finally {
      setProcessing(false);
    }
  };
  const handlePaymentError = (errorMessage: string) => {
    console.log("PAYMENT ERROR RECEIVED:", {
      errorMessage: errorMessage,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      formData: formData,
      orderSummary: orderSummary,
    });
    // Sanitize the error message before displaying to user
    const sanitizedMessage = sanitizeErrorMessage(errorMessage);
    setError(sanitizedMessage);
  };

  const createOrderInDatabase = async (paymentId?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare order items
      const orderItems = orderSummary.items.map((item) => {
        // Parse niche if it's a string
        let nicheData = item.niche_selected || null;
        if (typeof nicheData === "string") {
          try {
            nicheData = JSON.parse(nicheData);
          } catch (e) {
            nicheData = null;
          }
        }

        // Parse service content if it's a string
        let serviceData = item.service_selected || null;
        if (typeof serviceData === "string") {
          try {
            serviceData = JSON.parse(serviceData);
          } catch (e) {
            serviceData = null;
          }
        }

        return {
          entry_id: item.entry_id,
          product_name: item.product_url || "Produto",
          product_url: item.product_url,
          quantity: item.quantity || 1,
          unit_price: Number(item.price) || 0,
          total_price: (Number(item.price) || 0) * (item.quantity || 1),
          niche: nicheData,
          service_content: serviceData,
        };
      });

      // Calculate total amount
      const totalAmount = orderSummary.totalFinalPrice; // Create order
      const order = await createOrder({
        payment_method: paymentMethod,
        total_amount: totalAmount,
        billing_name: formData.name,
        billing_email: formData.email,
        billing_address: formData.address,
        billing_city: formData.city,
        billing_state: formData.state,
        billing_zip_code: formData.zipCode,
        billing_document_number: formData.documentNumber,
        phone: formData.phone,
        payment_id: paymentId,
        items: orderItems,
        idempotency_key: idempotencyKey, // <--- Envia o idempotency_key
      });

      if (!order) {
        throw new Error("Failed to create order");
      } // Clear cart after successful order creation
      await clearCart(user.id);
      window.dispatchEvent(new Event("cart-cleared"));

      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      console.log("ORDER CREATION ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        paymentMethod: paymentMethod,
        paymentId: paymentId,
        timestamp: new Date().toISOString(),
        totalAmount: orderSummary.totalFinalPrice,
        billingInfo: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          documentNumber: formData.documentNumber,
        },
      });
      throw error;
    }
  };

  const updateOrderPaymentId = async (orderId: string, paymentId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_id: paymentId })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order payment ID:", error);
        throw new Error(`Failed to update payment ID for order ${orderId}: ${error.message}`);
      }
      console.log(`✅ Payment ID ${paymentId} updated for order ${orderId}`);
      // Re-fetch order items to update their payment_id
      setLoadingItems(true);
      OrderItemService.listOrderItemsByOrder(orderId)
        .then((items) => {
          setOrderItems(items || []);
          // Corrigido: extrai benefits corretamente
          const fornecidoPeloCliente = (items || []).filter((item: any) => {
            const benefits = extrairBenefits(item.service_content);
            return (
              benefits === undefined ||
              benefits === null ||
              (Array.isArray(benefits) && benefits.length === 0) ||
              (typeof benefits === "string" && benefits.trim() === "")
            );
          });
          setConteudoCliente(fornecidoPeloCliente);
          setOutrosProdutos(
            (items || []).filter(
              (item: any) => !fornecidoPeloCliente.includes(item)
            )
          );
        })
        .finally(() => setLoadingItems(false));
    } catch (err) {
      console.error("Error updating order payment ID:", err);
      setError(sanitizeErrorMessage(
        err instanceof Error ? err.message : "Erro ao atualizar pagamento do pedido"
      ));
    }
  };

  const clearCart = async (userId: string) => {
    try {
      // Delete all items from cart_checkout_resume
      const { error: resumeError } = await supabase
        .from("cart_checkout_resume")
        .delete()
        .eq("user_id", userId);

      if (resumeError) throw resumeError;

      // Delete all items from shopping_cart_items
      const { error: cartError } = await supabase
        .from("shopping_cart_items")
        .delete()
        .eq("user_id", userId);

      if (cartError) throw cartError;

      // Delete order_totals for this user (clear temporary totals)
      const { error: totalsError } = await supabase
        .from("order_totals")
        .delete()
        .eq("user_id", userId);

      if (totalsError) throw totalsError;

      console.log("✅ Cart cleared successfully, including order_totals");

      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      console.log("CART CLEARING ERROR:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        userId: userId,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  };

  const handleCardDataChange = (data: any) => {
    setCardData(data);
  };

  async function handleSubmit(e: React.FormEvent) {
    console.log('[DEBUG] handleSubmit chamado');
    e.preventDefault();
    setProcessing(true);
    setError(null);
    
    try {
      // Validação prévia dos campos obrigatórios
      if (!cardData.cardNumber || !cardData.cardExpiry || !cardData.cardCvc || !cardData.cardholderName) {
        throw new Error("Por favor, preencha todos os dados do cartão");
      }
      
      if (!formData.name || !formData.email) {
        throw new Error("Por favor, preencha nome e email");
      }
      
      // Verificação robusta da sessão
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[DEBUG] Verificação de sessão:', {
        hasSession: !!sessionData?.session,
        hasAccessToken: !!sessionData?.session?.access_token,
        tokenExpiry: sessionData?.session?.expires_at,
        currentTime: new Date().toISOString(),
        sessionError: sessionError,
        userId: sessionData?.session?.user?.id
      });

      if (sessionError) {
        throw new Error(`Erro na sessão: ${sessionError.message}`);
      }

      if (!sessionData?.session?.access_token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      // Verificar se o token não está expirado
      const tokenExpiry = sessionData.session.expires_at;
      if (tokenExpiry && new Date(tokenExpiry * 1000) <= new Date()) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const access_token = sessionData.session.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-payment`;
      
      console.log('[DEBUG] Iniciando fluxo de pagamento com tokenização...');
      console.log('- Nome:', formData.name);
      console.log('- Email:', formData.email); 
      console.log('- CPF:', formData.documentNumber);
      console.log('- Valor (totalAmount):', totalAmount);
      console.log('- Tipo do valor:', typeof totalAmount);
      console.log('- Dados do cartão:', {
        cardNumber: cardData.cardNumber ? cardData.cardNumber.substring(0, 4) + '****' : 'VAZIO',
        cardExpiry: cardData.cardExpiry,
        cardCvc: cardData.cardCvc ? '***' : 'VAZIO',
        cardholderName: cardData.cardholderName
      });
      console.log('- Endereço de cobrança:', {
        address: formData.address,
        zipCode: formData.zipCode,
        city: formData.city,
        state: formData.state
      });

      // PASSO 1: Tokenizar o cartão primeiro
      console.log('[DEBUG] Passo 1: Tokenizando cartão...');
      
      // Log dos dados coletados do formulário
      console.log('[DEBUG] formData coletado do formulário:', {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        documentNumber: formData.documentNumber,
        company_name: formData.company_name,
        phone: formData.phone
      });

      // Garantir que o billing.address siga o padrão obrigatório da Pagar.me v5
      // Usando os campos coletados do formulário "Dados da Empresa"
      const rawAddress = formData.address?.trim() || "";
      const rawZipCode = formData.zipCode?.replace(/\D/g, "") || "";
      const rawCity = formData.city?.trim() || "";
      const rawState = formData.state?.trim() || "";

      // Construir line_1 completo no formato da documentação Pagar.me
      const fullAddress = rawAddress || "Rua das Flores, 123, Centro";

      const billingAddress = {
        line_1: fullAddress,
        zip_code: rawZipCode.padStart(8, '0') || "01234567",
        city: rawCity || "São Paulo",
        state: rawState || "SP",
        country: "BR"
      };

      // Validação rigorosa: todos os campos obrigatórios devem estar preenchidos
      const billingFieldsValid = Object.entries(billingAddress).every(([, v]) => typeof v === 'string' && v.length > 0);
      if (!billingFieldsValid) {
        console.log('[ERROR] Campos de billing inválidos:', {
          billingAddress,
          invalidFields: Object.entries(billingAddress).filter(([, v]) => !v || v.length === 0)
        });
        setError("Preencha todos os campos obrigatórios do endereço de cobrança.");
        setProcessing(false);
        return;
      }

      console.log('[DEBUG] Billing address final (Pagar.me v5 - Estrutura Oficial):', billingAddress);
      console.log('[DEBUG] Validação dos campos obrigatórios:', {
        line_1: { value: billingAddress.line_1, valid: !!billingAddress.line_1 },
        zip_code: { value: billingAddress.zip_code, valid: !!billingAddress.zip_code && billingAddress.zip_code.length === 8 },
        city: { value: billingAddress.city, valid: !!billingAddress.city },
        state: { value: billingAddress.state, valid: !!billingAddress.state },
        country: { value: billingAddress.country, valid: !!billingAddress.country }
      });
      
      const tokenPayload = {
        action: 'tokenize',
        card_number: cardData.cardNumber.replace(/\s/g, ""),
        card_exp_month: cardData.cardExpiry.substring(0, 2),
        card_exp_year: "20" + cardData.cardExpiry.substring(3, 5),
        card_cvv: cardData.cardCvc,
        card_holder_name: cardData.cardholderName
        // billing_address NÃO é enviado na tokenização v5
      };
      console.log('[DEBUG] Payload enviado para tokenização (SEM billing_address):', tokenPayload);
      console.log('[DEBUG] billing_address será usado apenas no pagamento, não na tokenização v5');
      console.log('[DEBUG] URL da função edge:', url);
      console.log('[DEBUG] access_token enviado:', access_token);
      console.log('[DEBUG] Headers enviados:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      });
      const tokenResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(tokenPayload)
      });

      const tokenResult = await tokenResponse.json();
      console.log('[DEBUG] Resultado da tokenização:', tokenResult);

      if (!tokenResponse.ok) {
        console.log('[DEBUG] return: tokenResponse não ok');
        const errorMsg = tokenResult.error || 'Ocorreu um erro inesperado. Tente novamente.';
        setError(errorMsg);
        setProcessing(false);
        return;
      }

      if (!tokenResult.card_token) {
        console.log('[DEBUG] return: tokenResult.card_token não gerado');
        setError('Token do cartão não foi gerado.');
        setProcessing(false);
        return;
      }

      console.log('[DEBUG] Token recebido, preparando para montar payload de pagamento');

      // Função utilitária para extrair country_code, area_code e number do telefone
      function parsePhone(phone: string) {
        // Remove tudo que não é número
        const digits = phone.replace(/\D/g, "");
        // country_code: 2 primeiros dígitos (ou 55 se não informado)
        let country_code = "55";
        let area_code = "";
        let number = "";
        if (digits.length >= 12) {
          country_code = digits.substring(0, 2);
          area_code = digits.substring(2, 4);
          number = digits.substring(4);
        } else if (digits.length === 11) {
          area_code = digits.substring(0, 2);
          number = digits.substring(2);
        } else if (digits.length === 10) {
          area_code = digits.substring(0, 2);
          number = digits.substring(2);
        } else {
          // fallback: tenta pegar os últimos 9 dígitos como número
          number = digits.slice(-9);
          area_code = digits.slice(-11, -9);
        }
        return { country_code, area_code, number };
      }
      // PASSO 2: Usar o token para fazer o pagamento
      console.log('[DEBUG] Passo 2: Montando payload de pagamento...');
      const selectedInstallmentObj = installmentsOptions.find(opt => opt.installments === selectedInstallments);
      if (!selectedInstallmentObj) {
        console.log('[DEBUG] return: selectedInstallmentObj não encontrado');
        setError('Selecione uma opção de parcelamento válida.');
        setProcessing(false);
        return;
      }
      // Extrai os campos do telefone
      const parsedPhone = parsePhone(formData.phone || "");
      const paymentPayload = {
        items: [
          {
            amount: totalAmount, // valor total em centavos (CORRETO)
            description: "Pedido Marketplace",
            quantity: 1,
            code: "ITEM_" + Date.now()
          }
        ],
        customer: {
          external_id: formData.email || formData.name || uuidv4(),
          name: formData.name,
          email: formData.email,
          document: formData.documentNumber.replace(/\D/g, ""), // Corrigido de tax_id para document
          type: formData.legal_status === "business" ? "company" : "individual", // Corrigido para company/individual
          phones: {
            mobile_phone: {
              country_code: parsedPhone.country_code,
              area_code: parsedPhone.area_code,
              number: parsedPhone.number
            }
          },
          address: billingAddress // Usar o mesmo objeto validado
        },
        payments: [
          {
            payment_method: "credit_card",
            credit_card: {
              installments: selectedInstallmentObj.installments,
              statement_descriptor: "MARKETPLACE",
              card_token: tokenResult.card_token,
              card: {
                holder_name: cardData.cardholderName || formData.name,
                billing_address: billingAddress
              }
            }
          }
        ]
      };
      console.log('[DEBUG] legal_status no submit:', formData.legal_status, '| document_type:', formData.legal_status === "business" ? "cnpj" : "cpf", '| type:', formData.legal_status === "business" ? "business" : "individual", '| document:', formData.documentNumber);
      console.log('[DEBUG] Payload de pagamento montado:', paymentPayload);
      
      // Validação adicional do billing_address
      console.log('[DEBUG] Validação billing_address:', {
        customer_address: paymentPayload.customer.address,
        credit_card_billing_address: paymentPayload.payments[0].credit_card.card.billing_address,
        objects_are_same: paymentPayload.customer.address === paymentPayload.payments[0].credit_card.card.billing_address,
        tokenization_address: billingAddress,
        all_three_match: (
          paymentPayload.customer.address === billingAddress &&
          paymentPayload.payments[0].credit_card.card.billing_address === billingAddress
        ),
        // Validação do campo billing obrigatório dentro de credit_card
        card_field_present: !!paymentPayload.payments[0].credit_card.card,
        holder_name: paymentPayload.payments[0].credit_card.card?.holder_name,
        billing_address_complete: paymentPayload.payments[0].credit_card.card?.billing_address,
        billing_zipcode: paymentPayload.payments[0].credit_card.card?.billing_address?.zip_code
      });
      
      console.log('[DEBUG] Vai enviar o pagamento para a função edge');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify(paymentPayload)
      });
      const result = await response.json();
      console.log('[DEBUG] Resposta recebida da função edge:', result);
      // LOGS DETALHADOS PARA DEBUG DO STATUS
      console.log('=== DEBUG RESPOSTA PAGAR.ME ===');
      console.log('Status HTTP:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Resultado completo:', JSON.stringify(result, null, 2));
      console.log('Status do pagamento:', result.status);
      console.log('ID do pedido:', result.id);

      if (!response.ok) {
        console.log('[DEBUG] return: response não ok');
        const errorMsg = result.error || 'Ocorreu um erro inesperado. Tente novamente.';
        setError(errorMsg);
        setProcessing(false);
        return;
      }

      // Verificar se o pagamento foi realmente aprovado
      if (result.status === 'failed') {
        const errorMessage = result.charges?.[0]?.last_transaction?.gateway_response?.errors?.[0]?.message || 
                           'Pagamento rejeitado pelo gateway';
        throw new Error(errorMessage);
      }

      // EXPANDINDO OS STATUS ACEITOS - incluindo processing, pending, etc.
      const statusesAceitos = ['paid', 'approved', 'processing', 'pending_payment', 'authorized'];
      if (statusesAceitos.includes(result.status)) {
        console.log('✅ Pagamento aceito com status:', result.status);
        
        // Para cartão, criar pedido diretamente aqui (não duplicar via handlePaymentSuccess)
        const order = await createOrderInDatabase(result.id);
        
        if (order) {
          setCurrentOrderId(order.id);
          
          // Update payment status to "paid" for successful payments
          console.log("💳 Atualizando status do pagamento para 'paid':", {
            orderId: order.id,
            paymentMethod: paymentMethod,
          });

          const { updateOrderStatus } = await import(
            "../../services/db-services/marketplace-services/order/OrderService"
          );
          const updateSuccess = await updateOrderStatus(
            order.id,
            "approved",
            "paid"
          );

          if (updateSuccess) {
            console.log("✅ Status do pagamento atualizado com sucesso para 'paid'");
          } else {
            console.error("❌ Falha ao atualizar status do pagamento");
          }

          // Enviar e-mail de confirmação
          try {
            const orderEmailData = {
              name: formData.name,
              email: formData.email,
              total: order.total_amount,
              items: orderSummary.items.map((item: any) => {
                let niche = "";
                if (Array.isArray(item.niche_selected) && item.niche_selected.length > 0) {
                  try {
                    const parsed = JSON.parse(item.niche_selected[0]);
                    niche = parsed.niche || parsed.title || parsed.name || "";
                  } catch {
                    niche = "";
                  }
                }
                let pacote = "";
                let word_count = "";
                if (Array.isArray(item.service_selected) && item.service_selected.length > 0) {
                  try {
                    const parsed = JSON.parse(item.service_selected[0]);
                    pacote = parsed.title || parsed.name || "";
                    word_count = parsed.word_count || "";
                  } catch {
                    pacote = "";
                    word_count = "";
                  }
                }
                return {
                  name: item.product_url || "Produto",
                  quantity: item.quantity,
                  price: item.price,
                  niche,
                  package: pacote,
                  word_count,
                };
              }),
            };
            const payload = { order: orderEmailData };
            console.log("Dados enviados para função Edge:", JSON.stringify(payload));
            await fetch(
              "https://uxbeaslwirkepnowydfu.functions.supabase.co/send-order-email",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
            console.log("E-mail de notificação de compra enviado para cliente e administrador (cartão)");
          } catch (emailErr) {
            console.error("Erro ao enviar e-mail de compra (cartão):", emailErr);
          }
          
          // Show success message
          setSuccess(true);
        }
      } else {
        console.log('❌ Status não aceito:', result.status);
        console.log('Status aceitos:', statusesAceitos);
        throw new Error(`Status do pagamento: ${result.status}. Aguarde a confirmação ou tente novamente.`);
      }
    } catch (error) {
      console.error('[ERROR] Erro no handleSubmit:', error);
      setError(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  }

  // Função para validar apenas o formulário de cartão de crédito
  const validateCardForm = () => {
    const cardNumberValid = !!(cardData.cardNumber && cardData.cardNumber.trim().length >= 13);
    const cardExpiryValid = !!(cardData.cardExpiry && cardData.cardExpiry.trim().length >= 4);
    const cardCvcValid = !!(cardData.cardCvc && cardData.cardCvc.trim().length >= 3);
    const cardHolderValid = !!(cardData.cardholderName && cardData.cardholderName.trim().length >= 2);
    const countryValid = !!(cardData.country && cardData.country.trim().length >= 2);
    
    return cardNumberValid && cardExpiryValid && cardCvcValid && cardHolderValid && countryValid;
  };

  // Função para validar se o formulário de informações de pagamento está preenchido para PIX
  const isPixFormValid = () => {
    const nameValid = !!(formData.name && formData.name.trim().length >= 2);
    const emailValid = !!(formData.email && formData.email.trim().includes('@'));
    const documentValid = !!(formData.documentNumber && formData.documentNumber.trim().length >= 8);
    const phoneValid = !!(formData.phone && formData.phone.trim().length >= 8);
    
    return nameValid && emailValid && documentValid && phoneValid;
  };

  // Função para validar se todos os campos obrigatórios dos dois formulários estão preenchidos
  const isAllFormsValid = () => {
    // Para cartão, precisa dos dois formulários válidos
    if (paymentMethod === "card") {
      return isPaymentInfoFormValid && isCardFormValid;
    }
    // Para outros métodos, só precisa do formulário de informações
    return isPaymentInfoFormValid;
  };

  // useEffect para atualizar estado de validação do formulário de cartão
  useEffect(() => {
    const isValid = validateCardForm();
    setIsCardFormValid(isValid);
  }, [cardData]);

  // useEffect para monitorar mudanças no isPaymentInfoFormValid
  useEffect(() => {
    console.log("🎯 isPaymentInfoFormValid CHANGED:", {
      newValue: isPaymentInfoFormValid,
      timestamp: new Date().toISOString()
    });
  }, [isPaymentInfoFormValid]);

  // useEffect para monitorar mudanças no isPaymentInfoFormValid
  useEffect(() => {
    console.log("🎯 isPaymentInfoFormValid CHANGED:", {
      newValue: isPaymentInfoFormValid,
      timestamp: new Date().toISOString()
    });
  }, [isPaymentInfoFormValid]);

  if (loading) {
    return (
      <>
        <PageMeta
          title="Pagamento | Marketplace"
          description="Página de pagamento"
        />
        <PageBreadcrumb pageTitle="Pagamento" />

        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          </div>
        </div>
      </>
    );
  }
  if (success) {
    return (
      <>
        <PageMeta
          title="Pagamento Concluído | Marketplace"
          description="Pagamento concluído com sucesso"
        />
        <PageBreadcrumb pageTitle="Pagamento Concluído" />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-green-500"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <path d="m9 11 3 3L22 4"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Obrigado! Pagamento{" "}
                    {paymentMethod === "boleto" ? "Pendente" : "Concluído"}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Seu pagamento de{" "}
                    {formatCurrency(
                      orderSummary.totalProductPrice +
                        orderSummary.totalContentPrice
                    )}{" "}
                    {paymentMethod === "boleto"
                      ? "está aguardando processamento"
                      : "foi processado com sucesso"}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" x2="12" y1="8" y2="12"></line>
                      <line x1="12" x2="12.01" y1="16" y2="16"></line>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {loadingItems ? (
                      <p className="text-blue-800 dark:text-blue-200 mb-4">
                        Carregando informações do pedido...
                      </p>
                    ) : (
                      <>
                        {conteudoCliente.length > 0 && (
                          <>
                            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                              Próximo Passo: Envie seu Conteúdo
                            </h2>
                            <p className="text-blue-800 dark:text-blue-200 mb-4">
                              {conteudoCliente.map((item) => (
                                <span key={item.id}>
                                  Para o produto{" "}
                                  <a
                                    href={item.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-700 dark:text-blue-300"
                                  >
                                    {item.product_name}
                                  </a>
                                  , você deve enviar o conteúdo.
                                  <br />
                                </span>
                              ))}
                            </p>
                          </>
                        )}
                        {outrosProdutos.length > 0 && (
                          <>
                            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                              Aguarde o envio do conteúdo
                            </h2>
                            <p className="text-blue-800 dark:text-blue-200 mb-4">
                              {outrosProdutos.map((item) => (
                                <span key={item.id}>
                                  Para o produto{" "}
                                  <a
                                    href={item.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-700 dark:text-blue-300"
                                  >
                                    {item.product_name}
                                  </a>
                                  , aguarde o envio do conteúdo.
                                  <br />
                                </span>
                              ))}
                            </p>
                          </>
                        )}
                        {conteudoCliente.length === 0 &&
                          outrosProdutos.length === 0 && (
                            <>
                              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Próximo Passo: Envie seu Conteúdo
                              </h2>
                              <p className="text-blue-800 dark:text-blue-200 mb-4">
                                Para dar continuidade ao seu pedido, você
                                precisa enviar o conteúdo do artigo. Acesse os
                                detalhes do pedido para fazer o upload.
                              </p>
                            </>
                          )}
                      </>
                    )}
                    <div className="mb-4">
                      <OrderProgress
                        currentStep={paymentMethod === "boleto" ? 2 : 3}
                        paymentStatus={
                          paymentMethod === "boleto" ? "pending" : "paid"
                        }
                        orderStatus={
                          paymentMethod === "boleto" ? "pending" : "processing"
                        }
                        hasArticleDocument={false}
                        articleUrl=""
                        orderDate={new Date().toLocaleDateString("pt-BR")}
                        showProgressOnly={true}
                        orderId={currentOrderId || ""}
                        orderItems={orderItems}
                      />
                    </div>
                    <button
                      onClick={() =>
                        currentOrderId && navigate(`/orders/${currentOrderId}`)
                      }
                      disabled={!currentOrderId}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Acessar Detalhes do Pedido
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  O que acontece agora?
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300">
                      Você receberá um email de confirmação com todos os
                      detalhes da compra
                    </p>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="M10 9H8"></path>
                      <path d="M16 13H8"></path>
                      <path d="M16 17H8"></path>
                    </svg>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Envie o conteúdo do seu artigo
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Acesse "Detalhes do Pedido" para fazer o upload do
                        arquivo ou inserir o texto
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        Prazo de publicação: 3-5 dias úteis
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Após o envio do conteúdo, seu artigo será publicado no
                        site escolhido
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    currentOrderId
                      ? navigate(`/orders/${currentOrderId}`)
                      : navigate("/orders")
                  }
                  className="min-w-[200px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                  Enviar Conteúdo
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <CouponProvider>
      <PageMeta
        title="Pagamento | Marketplace"
        description="Página de pagamento"
      />
      <PageBreadcrumb pageTitle="Pagamento" />

      {/* Watcher para pagamento PIX */}
      {paymentMethod === "pix" && currentOrderId && (
        <PixPaymentWatcher
          orderId={currentOrderId}
          onPixPaid={() => handlePaymentSuccess(currentOrderId)}
        />
      )}

      <div className="min-h-screen">
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto items-start">
          <div className="w-full md:w-3/5">
            <PaymentInformationForm
              formData={formData}
              onChange={handleInputChange}
              onValidSubmit={(isValid) => {
                console.log("🎯 RECEBIDO RESULTADO DA VALIDAÇÃO NO PAYMENT.TSX:", {
                  isValid: isValid,
                  timestamp: new Date().toISOString()
                });
                console.log("📝 ANTES: isPaymentInfoFormValid =", isPaymentInfoFormValid);
                setIsPaymentInfoFormValid(isValid);
                console.log("📝 DEPOIS: setIsPaymentInfoFormValid chamado com:", isValid);
              }}
            />

            <PaymentMethodForm
              paymentMethod={paymentMethod}
              // stripePromise={stripePromise} // [PAUSADO] Stripe temporariamente desativado
              totalAmount={totalAmount}
              pixQrCodeUrl={pixQrCodeUrl}
              pixCopiaECola={pixCopiaECola}
              total={orderSummary.totalFinalPrice}
              processing={processing}
              error={error}
              termsAccepted={termsAccepted}
              pixFormValid={isPixFormValid()}
              availablePaymentMethods={availablePaymentMethods}
              onPaymentMethodChange={handlePaymentMethodChange}
              onTermsAcceptedChange={setTermsAccepted}
              onSubmit={handleSubmit}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCardDataChange={handleCardDataChange}
              cardData={cardData}
              setCardData={setCardData}
              onGeneratePixQrCode={generatePixQrCode}
              allFormsValid={isAllFormsValid()}
              // NOVOS: Estados de validação individuais
              isPaymentInfoFormValid={isPaymentInfoFormValid}
              isCardFormValid={isCardFormValid}
              // [2] No JSX, passe o setter para o componente de seleção de parcelas (exemplo):
              // <InstallmentsOptions selected={selectedInstallments} onSelect={setSelectedInstallments} ... />
              selectedInstallments={selectedInstallments}
              onInstallmentsChange={setSelectedInstallments}
              installmentsOptions={installmentsOptions}
              setInstallmentsOptions={setInstallmentsOptions}
            />
          </div>

          {/* Container com largura fixa para o sticky */}
          <div className="w-full md:w-2/5">
            {/* Placeholder para manter o espaço quando sticky estiver ativo */}
            <div ref={stickyHook.placeholderRef} style={stickyHook.placeholderStyle} />
            
            <div 
              ref={stickyHook.ref}
              style={stickyHook.style}
              className="w-full"
            >
              <FinishOrder />
            </div>
          </div>
        </div>
      </div>
    </CouponProvider>
  );
}
