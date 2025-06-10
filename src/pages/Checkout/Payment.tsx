import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { supabase } from "../../lib/supabase";
import PaymentInformationForm from "../../components/Checkout/PaymentInformationForm";
import PaymentMethodForm from "../../components/Checkout/PaymentMethodForm";
import OrderSummary from "../../components/Checkout/OrderSummary";
import { createOrder } from "../../context/db-context/services/OrderService";
import { sanitizeErrorMessage } from "../../utils/errorSanitizer";
import { formatCurrency } from "../../components/marketplace/utils";

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

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [processing, setProcessing] = useState(false);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    documentNumber: ""
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    items: [] as any[],
    totalProductPrice: 0,
    totalContentPrice: 0,
    totalFinalPrice: 0
  });
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    string[]
  >(["card"]);

  useEffect(() => {
    loadPaymentSettings();
    loadOrderTotal();
    loadCompanyData();
    loadCartItems();
  }, []);
  async function loadPaymentSettings() {
    try {
      setLoading(true);
      setError("");

      console.log("LOADING PAYMENT SETTINGS:", {
        timestamp: new Date().toISOString(),
        message: "Starting to load payment settings from database"
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
        timestamp: new Date().toISOString()
      });

      if (error) throw error;

      if (data?.stripe_enabled && data?.stripe_public_key) {
        console.log("INITIALIZING STRIPE:", {
          stripeEnabled: data.stripe_enabled,
          stripeKeyPrefix: data.stripe_public_key.substring(0, 20),
          timestamp: new Date().toISOString()
        });

        // Initialize Stripe with the public key
        const stripeInstance = loadStripe(data.stripe_public_key);
        setStripePromise(stripeInstance);

        console.log("STRIPE INSTANCE CREATED:", {
          stripeInstanceCreated: true,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log("STRIPE NOT INITIALIZED:", {
          stripeEnabled: data?.stripe_enabled,
          hasStripeKey: !!data?.stripe_public_key,
          reason: !data?.stripe_enabled
            ? "Stripe not enabled"
            : "No Stripe public key",
          timestamp: new Date().toISOString()
        });
      }

      // Set available payment methods from settings
      if (data?.payment_methods && Array.isArray(data.payment_methods)) {
        setAvailablePaymentMethods(data.payment_methods);

        console.log("PAYMENT METHODS SET:", {
          paymentMethods: data.payment_methods,
          defaultMethod: data.payment_methods[0],
          timestamp: new Date().toISOString()
        });

        // Set default payment method to the first available one
        if (data.payment_methods.length > 0) {
          setPaymentMethod(data.payment_methods[0]);
        }
      } else {
        console.log("NO PAYMENT METHODS FOUND:", {
          hasPaymentMethods: !!data?.payment_methods,
          isArray: Array.isArray(data?.payment_methods),
          paymentMethodsData: data?.payment_methods,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error loading payment settings:", err);
      console.log("PAYMENT SETTINGS LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
      setError("Erro ao carregar configurações de pagamento");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrderTotal() {
    try {
      const {
        data: { user }
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
          totalFinalPrice: Number(data.total_final_price)
        }));
      }
    } catch (err) {
      console.error("Error loading order total:", err);
      console.log("ORDER TOTAL LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  async function loadCartItems() {
    try {
      const {
        data: { user }
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
          items: cartItems
        }));
      }
    } catch (err) {
      console.error("Error loading cart items:", err);
      console.log("CART ITEMS LOADING ERROR:", {
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  async function loadCompanyData() {
    try {
      const {
        data: { user }
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
        timestamp: new Date().toISOString()
      });
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);

    // Generate PIX QR code if PIX is selected
    if (method === "pix") {
      generatePixQrCode();
    } else {
      setPixQrCodeUrl(null);
      setPixCopiaECola(null);
    }
  };

  const generatePixQrCode = async () => {
    try {
      setProcessing(true);

      // Get the current session
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No authenticated session found");
      }

      // Get the total amount
      const total =
        orderSummary.totalProductPrice + orderSummary.totalContentPrice;

      // Call the create-pix-qrcode function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-pix-qrcode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // Convert to cents
            description: `Pedido Marketplace - ${new Date().toISOString()}`
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PIX QR code");
      }

      const { pixQrCode, pixCopiaECola: pixCode } = await response.json();

      setPixQrCodeUrl(pixQrCode);
      setPixCopiaECola(pixCode);
    } catch (err: any) {
      console.error("Error generating PIX QR code:", err);
      console.log("PIX QR CODE GENERATION ERROR:", {
        errorMessage: err.message,
        errorStack: err.stack,
        paymentMethod: "pix",
        timestamp: new Date().toISOString(),
        totalAmount:
          orderSummary.totalProductPrice + orderSummary.totalContentPrice,
        sessionInfo: "PIX QR Code generation failed"
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
        timestamp: new Date().toISOString()
      }); // Create order in database
      const order = await createOrderInDatabase(paymentId);

      if (order) {
        // Update payment status to "paid" for successful payments
        console.log("💳 Atualizando status do pagamento para 'paid':", {
          orderId: order.id,
          paymentMethod: paymentMethod
        });

        const { updateOrderStatus } = await import(
          "../../context/db-context/services/OrderService"
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
        formData: formData
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
      orderSummary: orderSummary
    });
    // Sanitize the error message before displaying to user
    const sanitizedMessage = sanitizeErrorMessage(errorMessage);
    setError(sanitizedMessage);
  };

  const createOrderInDatabase = async (paymentId?: string) => {
    try {
      const {
        data: { user }
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
          service_content: serviceData
        };
      });

      // Calculate total amount
      const totalAmount =
        orderSummary.totalProductPrice + orderSummary.totalContentPrice;

      // Create order
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
        payment_id: paymentId,
        items: orderItems
      });

      if (!order) {
        throw new Error("Failed to create order");
      } // Clear cart after successful order creation
      await clearCart(user.id);

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
          documentNumber: formData.documentNumber
        }
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
        timestamp: new Date().toISOString()
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Validate form data
    if (
      !formData.name ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.documentNumber
    ) {
      console.log("FORM VALIDATION ERROR:", {
        errorType: "missing_required_fields",
        timestamp: new Date().toISOString(),
        paymentMethod: paymentMethod,
        formData: formData,
        missingFields: {
          name: !formData.name,
          email: !formData.email,
          address: !formData.address,
          city: !formData.city,
          state: !formData.state,
          zipCode: !formData.zipCode,
          documentNumber: !formData.documentNumber
        }
      });
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!termsAccepted) {
      console.log("TERMS VALIDATION ERROR:", {
        errorType: "terms_not_accepted",
        timestamp: new Date().toISOString(),
        paymentMethod: paymentMethod,
        termsAccepted: termsAccepted
      });
      setError("Por favor, aceite os termos e condições para continuar");
      return;
    }

    if (paymentMethod === "card") {
      console.log("CARD PAYMENT - WILL BE HANDLED BY STRIPE:", {
        paymentMethod: "card",
        timestamp: new Date().toISOString(),
        formData: formData,
        message: "Card payment will be processed by Stripe component"
      });
      // Card payments are handled directly by the StripePaymentForm component
      // This function should not be called for card payments
      setError(
        "Erro interno: pagamento com cartão deve ser processado pelo Stripe"
      );
      return;
    }

    if (paymentMethod !== "card") {
      try {
        setProcessing(true);
        setError(null); // For boleto, navigate to the boleto success page
        if (paymentMethod === "boleto") {
          try {
            console.log("BOLETO PAYMENT PROCESSING:", {
              paymentMethod: "boleto",
              timestamp: new Date().toISOString(),
              formData: formData,
              orderSummary: orderSummary,
              totalAmount:
                orderSummary.totalProductPrice + orderSummary.totalContentPrice
            });

            // Create order in database first - boleto stays as "pending" until paid
            const boletoPaymentId = `boleto_${Date.now()}`;
            const order = await createOrderInDatabase(boletoPaymentId);

            console.log("📋 Pedido criado para boleto:", {
              orderId: order?.id,
              paymentId: boletoPaymentId,
              status: "pending" // Boleto permanece pendente até confirmação
            });

            // Create mock boleto data
            const boletoData = {
              orderId: order?.id,
              barCode: "42297.11504 00064.897317 04021.401122 1 11070000082900",
              amount:
                orderSummary.totalProductPrice + orderSummary.totalContentPrice,
              expirationDate: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("pt-BR"),
              boletoUrl: "#"
            };

            navigate("/checkout/boleto-success", { state: { boletoData } });
            return;
          } catch (boletoError: any) {
            console.error("Boleto processing error:", boletoError);
            console.log("BOLETO PROCESSING ERROR:", {
              errorMessage: boletoError.message,
              errorStack: boletoError.stack,
              paymentMethod: "boleto",
              timestamp: new Date().toISOString(),
              formData: formData,
              orderSummary: orderSummary
            });
            throw boletoError;
          }
        }

        // For PIX, create order immediately and mark as paid (since it's instant)
        if (paymentMethod === "pix") {
          console.log("💰 PIX PAYMENT PROCESSING:", {
            paymentMethod: "pix",
            timestamp: new Date().toISOString(),
            message: "PIX é processado instantaneamente"
          });

          const pixPaymentId = `pix_${Date.now()}`;
          const order = await createOrderInDatabase(pixPaymentId);
          if (order) {
            // PIX is instant, so mark as paid immediately
            const { updateOrderStatus } = await import(
              "../../context/db-context/services/OrderService"
            );
            const updateSuccess = await updateOrderStatus(
              order.id,
              "approved",
              "paid"
            );

            console.log("🎉 PIX - Status atualizado para 'paid':", {
              orderId: order.id,
              updateSuccess: updateSuccess
            });
          }

          setSuccess(true);
          return;
        }

        // Process payment with selected method
        const paymentId = await processPayment(paymentMethod);

        handlePaymentSuccess(paymentId);
      } catch (err: any) {
        console.error("Payment error:", err);
        console.log("PAYMENT ERROR DETAILS:", {
          errorMessage: err.message,
          errorStack: err.stack,
          paymentMethod: paymentMethod,
          timestamp: new Date().toISOString(),
          userFormData: formData,
          orderSummary: orderSummary,
          totalAmount:
            orderSummary.totalProductPrice + orderSummary.totalContentPrice
        });
        const sanitizedMessage = sanitizeErrorMessage(
          err.message || "Erro ao processar pagamento"
        );
        setError(sanitizedMessage);
      } finally {
        setProcessing(false);
      }
    }
  };

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

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center">
              <div className="w-12 h-12 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-success-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Pagamento Concluído!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Seu pagamento de{" "}
                  {formatCurrency(
                    orderSummary.totalProductPrice +
                      orderSummary.totalContentPrice
                  )}{" "}
                  foi processado com sucesso
                </p>
              </div>
            </div>

            {/* Success Information */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                O que acontece agora?
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-success-500 mt-0.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300">
                    Você receberá um email de confirmação com todos os detalhes
                    da compra
                  </p>
                </div>

                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-success-500 mt-0.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300">
                    Você pode acompanhar o status do seu pedido na seção "Meus
                    Pedidos"
                  </p>
                </div>

                {paymentMethod === "card" && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-success-500 mt-0.5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pagamento processado instantaneamente via cartão de
                      crédito
                    </p>
                  </div>
                )}

                {paymentMethod === "pix" && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-success-500 mt-0.5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300">
                      Pagamento processado instantaneamente via PIX
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-success-600 dark:text-success-500 mt-0.5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-success-800 dark:text-success-400">
                      Obrigado pela sua compra!
                    </h4>
                    <p className="mt-1 text-sm text-success-700 dark:text-success-300">
                      Seu pedido foi registrado com sucesso e já está sendo
                      processado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => navigate("/orders")}
                  className="min-w-[180px]"
                >
                  Ver Meus Pedidos
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="min-w-[180px]"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          </div>
        </div>
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
            stripePromise={stripePromise}
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
            onPaymentMethodChange={handlePaymentMethodChange}
            onTermsAcceptedChange={setTermsAccepted}
            onSubmit={handleSubmit}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>

        <div className="w-full md:w-2/5">
          {" "}
          <OrderSummary
            items={orderSummary.items}
            totalProductPrice={orderSummary.totalProductPrice}
            totalContentPrice={orderSummary.totalContentPrice}
            totalFinalPrice={orderSummary.totalFinalPrice}
          />
        </div>
      </div>
    </>
  );
}
