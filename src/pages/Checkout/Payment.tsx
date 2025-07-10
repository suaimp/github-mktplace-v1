import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { loadStripe } from "@stripe/stripe-js"; // [PAUSADO] Stripe temporariamente desativado
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { supabase } from "../../lib/supabase";
import PaymentInformationForm from "../../components/Checkout/PaymentInformationForm";
import PaymentMethodForm from "../../components/Checkout/PaymentMethodForm";
import FinishOrder from "../../components/Checkout/FinishOrder";
import OrderProgress from "../Orders/local-components/OrderProgress";
import { createOrder } from "../../services/db-services/marketplace-services/order/OrderService";
import { sanitizeErrorMessage } from "../../utils/errorSanitizer";
import { formatCurrency } from "../../components/marketplace/utils";
// import { validatePhone } from "../../utils/phoneValidation"; // [PAUSADO] Temporariamente comentado
import { OrderItemService } from "../../services/db-services/marketplace-services/order/OrderItemService";
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
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    items: [] as any[],
    totalProductPrice: 0,
    totalContentPrice: 0,
    totalFinalPrice: 0,
  });
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    string[]
  >(["card", "pix"]);
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
  const [pixPollingInterval, setPixPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pixExpiredAt, setPixExpiredAt] = useState<Date | null>(null);

  useEffect(() => {
    loadPaymentSettings();
    loadOrderTotal();
    loadCompanyData();
    loadCartItems();
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
      if (data?.payment_methods && Array.isArray(data.payment_methods)) {
        // Garantir que PIX sempre esteja disponível
        const paymentMethods = [...data.payment_methods];
        if (!paymentMethods.includes("pix")) {
          paymentMethods.push("pix");
        }
        setAvailablePaymentMethods(paymentMethods);

        console.log("PAYMENT METHODS SET:", {
          paymentMethods: paymentMethods,
          defaultMethod: paymentMethods[0],
          timestamp: new Date().toISOString(),
        });

        // Set default payment method to the first available one
        if (paymentMethods.length > 0) {
          setPaymentMethod(paymentMethods[0]);
        }
      } else {
        // Se não houver configuração no banco, usar métodos padrão
        setAvailablePaymentMethods(["card", "pix"]);
        setPaymentMethod("card");
        
        console.log("NO PAYMENT METHODS FOUND - USING DEFAULTS:", {
          hasPaymentMethods: !!data?.payment_methods,
          isArray: Array.isArray(data?.payment_methods),
          paymentMethodsData: data?.payment_methods,
          defaultMethods: ["card", "pix"],
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error loading payment settings:", err);
      console.log("PAYMENT SETTINGS LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
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
        .select("total_product_price, total_content_price, total_final_price")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Convert to cents for Stripe
        setTotalAmount(Math.round(parseFloat(data.total_final_price) * 100));
        setOrderSummary((prev) => ({
          ...prev,
          totalProductPrice: Number(data.total_product_price),
          totalContentPrice: Number(data.total_content_price),
          totalFinalPrice: Number(data.total_final_price),
        }));
      }
    } catch (err) {
      console.error("Error loading order total:", err);
      console.log("ORDER TOTAL LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
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
    } catch (err) {
      console.error("Error loading cart items:", err);
      console.log("CART ITEMS LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
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
    } catch (err) {
      console.error("Error loading company data:", err);
      console.log("COMPANY DATA LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setPaymentMethodHandler = (method: string) => {
    console.log("[DEBUG] Mudando método de pagamento para:", method);
    
    // Limpar polling do PIX se estava ativo
    if (method !== "pix") {
      stopPixPolling();
      setPixQrCodeUrl(null);
      setPixCopiaECola(null);
      setCurrentOrderId(null);
    }
    
    setPaymentMethod(method);
    setError(null); // Limpar erros anteriores
    
    // Gerar PIX automaticamente quando selecionado
    if (method === "pix") {
      generatePixQrCode();
    }
  };

  const generatePixQrCode = async () => {
    try {
      setProcessing(true);

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No authenticated session found");
      }

      // Get the total amount
      const total =
        orderSummary.totalProductPrice + orderSummary.totalContentPrice;

      // Preparar itens do pedido para o PIX
      const orderItems = orderSummary.items.map((item, index) => ({
        amount: Math.round((item.total_price || 0) * 100), // converter para centavos
        description: item.product_name || `Item ${index + 1}`,
        quantity: item.quantity || 1,
        code: item.product_id || `ITEM_${index + 1}`
      }));

      console.log("[DEBUG PIX] Dados enviados para PIX:", {
        amount: Math.round(total * 100),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_document: formData.documentNumber,
        order_items: orderItems
      });

      // Call the pagarme-pix-payment function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-pix-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to cents
            customer_name: formData.name,
            customer_email: formData.email,
            customer_document: formData.documentNumber,
            order_items: orderItems
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PIX QR code");
      }

      const pixData = await response.json();
      console.log("[DEBUG PIX] Resposta do PIX:", pixData);

      if (pixData.success && pixData.qr_code_url) {
        setPixQrCodeUrl(pixData.qr_code_url);
        setPixCopiaECola(pixData.qr_code);
        
        // Iniciar polling para verificar status do pagamento
        if (pixData.order_id) {
          setCurrentOrderId(pixData.order_id);
          startPixPolling(pixData.order_id);
        }
      } else {
        throw new Error("Dados do PIX inválidos na resposta");
      }
    } catch (err: any) {
      console.error("Error generating PIX QR code:", err);
      console.log("PIX QR CODE GENERATION ERROR:", {
        errorMessage: err.message,
        errorStack: err.stack,
        paymentMethod: "pix",
        timestamp: new Date().toISOString(),
        totalAmount:
          orderSummary.totalProductPrice + orderSummary.totalContentPrice,
        sessionInfo: "PIX QR Code generation failed",
      });
      const sanitizedMessage = sanitizeErrorMessage(
        err.message || "Erro ao gerar QR code PIX"
      );
      setError(sanitizedMessage);
    } finally {
      setProcessing(false);
    }
  };
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      setProcessing(true);

      console.log("🎉 PAYMENT SUCCESS - Processando pagamento bem-sucedido:", {
        paymentId: paymentId,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString(),
      }); // Create order in database
      const order = await createOrderInDatabase(paymentId);

      if (order) {
        // Store the order ID
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
          console.log(
            "✅ Status do pagamento atualizado com sucesso para 'paid'"
          );
        } else {
          console.error("❌ Falha ao atualizar status do pagamento");
        }

        // Enviar e-mail de compra para MoisesDev2022@gmail.com (notificação de compra)
        try {
          const orderEmailData = {
            name: formData.name,
            email: formData.email,
            total: order.total_amount,
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
          const payload = {
            order: orderEmailData,
          };
          console.log("Dados enviados para função Edge:", JSON.stringify(payload));
          await fetch(
            "https://uxbeaslwirkepnowydfu.functions.supabase.co/send-order-email",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          console.log("E-mail de notificação de compra enviado para cliente e administrador (boleto/pix)");
        } catch (emailErr) {
          console.error("Erro ao enviar e-mail de compra (boleto/pix):", emailErr);
        }
      }

      // Show success message
      setSuccess(true);
    } catch (err) {
      console.error("Error processing successful payment:", err);
      console.log("PAYMENT SUCCESS PROCESSING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        paymentId: paymentId,
        timestamp: new Date().toISOString(),
        orderSummary: orderSummary,
        formData: formData,
      });
      setError("Erro ao finalizar o pagamento");
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
      const totalAmount =
        orderSummary.totalProductPrice + orderSummary.totalContentPrice; // Create order
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
        totalAmount:
          orderSummary.totalProductPrice + orderSummary.totalContentPrice,
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
      
      // Garantir que o billing_address siga EXATAMENTE o padrão da documentação oficial da Pagar.me
      // Ref: https://docs.pagar.me/reference/endereços - zip_code deve ser INTEGER
      const billingAddress = {
        line_1: formData.address?.trim() || "Rua das Flores, 123",
        zip_code: parseInt((formData.zipCode?.replace(/\D/g, "") || "01234567")), // INTEGER conforme documentação
        city: formData.city?.trim() || "São Paulo", 
        state: formData.state?.trim() || "SP", // Sigla do estado
        country: "BR" // Sempre BR para Brasil
      };
      
      // Validação extra para garantir que nenhum campo seja vazio (conforme documentação)
      if (!billingAddress.line_1 || billingAddress.line_1.trim() === '') {
        billingAddress.line_1 = "Rua das Flores, 123";
      }
      if (!billingAddress.zip_code || isNaN(billingAddress.zip_code)) {
        billingAddress.zip_code = 1234567;
      }
      if (!billingAddress.city || billingAddress.city.trim() === '') {
        billingAddress.city = "São Paulo";
      }
      if (!billingAddress.state || billingAddress.state.trim() === '') {
        billingAddress.state = "SP";
      }
      
      console.log('[DEBUG] Billing address final (padrão Pagar.me):', billingAddress);
      console.log('[DEBUG] Validação billing address:', {
        line_1_length: billingAddress.line_1.length,
        zip_code: billingAddress.zip_code,
        zip_code_type: typeof billingAddress.zip_code,
        city_length: billingAddress.city.length,
        state_length: billingAddress.state.length,
        country: billingAddress.country,
        all_fields_valid: !!(billingAddress.line_1 && billingAddress.zip_code && billingAddress.city && billingAddress.state && billingAddress.country)
      });
      
      const tokenResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          action: 'tokenize',
          card_number: cardData.cardNumber.replace(/\s/g, ""),
          card_exp_month: cardData.cardExpiry.substring(0, 2),
          card_exp_year: "20" + cardData.cardExpiry.substring(3, 5),
          card_cvv: cardData.cardCvc,
          card_holder_name: cardData.cardholderName,
          billing_address: billingAddress
        })
      });

      const tokenResult = await tokenResponse.json();
      console.log('[DEBUG] Resultado da tokenização:', tokenResult);

      if (!tokenResponse.ok) {
        throw new Error(tokenResult.error || 'Erro ao tokenizar cartão');
      }

      if (!tokenResult.card_token) {
        throw new Error('Token do cartão não foi gerado');
      }

      // PASSO 2: Usar o token para fazer o pagamento
      console.log('[DEBUG] Passo 2: Processando pagamento com token...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          action: 'payment_with_token',
          amount: totalAmount,
          card_token: tokenResult.card_token,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_document: formData.documentNumber,
          billing_address: billingAddress // Incluir billing_address no pagamento também
        })
      });

      const result = await response.json();
      
      // LOGS DETALHADOS PARA DEBUG DO STATUS
      console.log('=== DEBUG RESPOSTA PAGAR.ME ===');
      console.log('Status HTTP:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Resultado completo:', JSON.stringify(result, null, 2));
      console.log('Status do pagamento:', result.status);
      console.log('ID do pedido:', result.id);
      
      if (result.charges && result.charges.length > 0) {
        const charge = result.charges[0];
        console.log('Status do charge:', charge.status);
        console.log('ID do charge:', charge.id);
        
        if (charge.last_transaction) {
          console.log('Status da transação:', charge.last_transaction.status);
          console.log('Código de resposta:', charge.last_transaction.acquirer_return_code);
          console.log('Mensagem:', charge.last_transaction.acquirer_message);
          
          if (charge.last_transaction.gateway_response) {
            console.log('Resposta do gateway:', charge.last_transaction.gateway_response);
          }
        }
      }
      console.log('===============================');
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erro ao processar pagamento');
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
        await handlePaymentSuccess(result.id);
      } else {
        console.log('❌ Status não aceito:', result.status);
        console.log('Status aceitos:', statusesAceitos);
        throw new Error(`Status do pagamento: ${result.status}. Aguarde a confirmação ou tente novamente.`);
      }
    } catch (err: any) {
      console.error('[ERROR] Erro no handleSubmit:', err);
      setError(err.message || "Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  }

  // Função para fazer polling do status do PIX
  const startPixPolling = (orderId: string) => {
    console.log("[DEBUG PIX] Iniciando polling para order_id:", orderId);
    
    // Limpar polling anterior se existir
    if (pixPollingInterval) {
      clearInterval(pixPollingInterval);
    }

    // Configurar expiração (1 hora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    setPixExpiredAt(expiresAt);

    const checkPaymentStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("[DEBUG PIX] Sessão não encontrada, parando polling");
          stopPixPolling();
          return;
        }

        // Verificar se expirou
        if (new Date() > expiresAt) {
          console.log("[DEBUG PIX] PIX expirado, parando polling");
          stopPixPolling();
          setError("O PIX expirou. Por favor, gere um novo código.");
          return;
        }

        console.log("[DEBUG PIX] Verificando status do pedido:", orderId);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-pix-status`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ order_id: orderId }),
          }
        );

        if (response.ok) {
          const statusData = await response.json();
          console.log("[DEBUG PIX] Status recebido:", statusData);

          if (statusData.success) {
            if (statusData.is_paid) {
              console.log("[DEBUG PIX] ✅ Pagamento confirmado!");
              stopPixPolling();
              await handlePaymentSuccess(orderId);
            } else if (statusData.is_failed) {
              console.log("[DEBUG PIX] ❌ Pagamento falhou");
              stopPixPolling();
              setError("O pagamento PIX falhou. Tente novamente.");
            } else {
              console.log("[DEBUG PIX] ⏳ Pagamento ainda pendente");
            }
          }
        } else {
          console.log("[DEBUG PIX] Erro ao verificar status:", response.status);
        }
      } catch (err) {
        console.error("[DEBUG PIX] Erro no polling:", err);
      }
    };

    // Primeira verificação imediata
    checkPaymentStatus();

    // Depois verificar a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000);
    setPixPollingInterval(interval);

    console.log("[DEBUG PIX] Polling configurado, verificando a cada 5 segundos até", expiresAt.toISOString());
  };

  const stopPixPolling = () => {
    if (pixPollingInterval) {
      clearInterval(pixPollingInterval);
      setPixPollingInterval(null);
    }
    setPixExpiredAt(null);
    console.log("[DEBUG PIX] Polling interrompido");
  };

  // Limpar polling quando o componente for desmontado
  useEffect(() => {
    return () => {
      stopPixPolling();
    };
  }, []);

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
    <>
      <PageMeta
        title="Pagamento | Marketplace"
        description="Página de pagamento"
      />
      <PageBreadcrumb pageTitle="Pagamento" />

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto">
        <div className="w-full md:w-3/5">
          <PaymentInformationForm
            formData={formData}
            onChange={handleInputChange}
          />

          <PaymentMethodForm
            paymentMethod={paymentMethod}
            // stripePromise={stripePromise} // [PAUSADO] Stripe temporariamente desativado
            totalAmount={totalAmount}
            pixQrCodeUrl={pixQrCodeUrl}
            pixCopiaECola={pixCopiaECola}
            total={
              orderSummary.totalProductPrice + orderSummary.totalContentPrice
            }
            processing={processing}
            error={error}
            termsAccepted={termsAccepted}
            availablePaymentMethods={availablePaymentMethods}
            onPaymentMethodChange={setPaymentMethodHandler}
            onTermsAcceptedChange={setTermsAccepted}
            onSubmit={handleSubmit}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCardDataChange={handleCardDataChange}
          />
        </div>

        <div className="w-full md:w-2/5">
          {/* Substituído OrderSummary por FinishOrder */}
          <FinishOrder />
        </div>
      </div>
    </>
  );
}
