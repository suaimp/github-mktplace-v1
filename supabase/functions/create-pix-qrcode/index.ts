import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);
serve(async (req)=>{
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "Missing authorization header"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: "Unauthorized"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Get the request body
    const { amount, description } = await req.json();
    if (!amount) {
      return new Response(JSON.stringify({
        error: "Missing required parameters"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Get company data for the user
    const { data: companyData, error: companyError } = await supabase.from("company_data").select("*").eq("admin_id", user.id).maybeSingle();
    if (companyError && companyError.code !== "PGRST116") {
      console.error("Error fetching company data:", companyError);
    }
    // Get the payment settings
    const { data: settings, error: settingsError } = await supabase.from("payment_settings").select("*").single();
    if (settingsError) {
      console.error("Error fetching payment settings:", settingsError);
      return new Response(JSON.stringify({
        error: "Failed to fetch payment settings"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Get order details from the database
    const { data: orderData, error: orderError } = await supabase.from("order_totals").select("*").eq("user_id", user.id).single();
    if (orderError) {
      console.error("Error fetching order:", orderError);
      return new Response(JSON.stringify({
        error: "Failed to fetch order details"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // For demonstration purposes, we'll generate a static PIX code
    // In a real implementation, you would integrate with a payment gateway
    // Generate a unique transaction ID
    const transactionId = `TX${Date.now()}${Math.floor(Math.random() * 1000)}`;
    // Format the amount as currency
    const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    // Create a PIX payload
    // This is a simplified example - in a real implementation, you would use a proper PIX library
    const pixPayload = {
      pixKey: "example@email.com",
      description: description || `Pedido #${orderData.id}`,
      merchantName: "Sua Empresa",
      merchantCity: "São Paulo",
      txid: transactionId,
      amount: amount / 100
    };
    // Generate a QR code URL
    // In a real implementation, you would generate a proper PIX QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(pixPayload))}`;
    // Generate a copy-paste code
    // In a real implementation, this would be a properly formatted PIX code
    const copiaECola = `00020126580014br.gov.bcb.pix0136${transactionId}0224${description ? encodeURIComponent(description) : "Pagamento Marketplace"}5204000053039865802BR5913Sua Empresa6008Sao Paulo62070503***63041234`;
    // Save the payment information
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        user_id: user.id,
        order_id: orderData.id,
        payment_method: "pix",
        amount: amount / 100,
        status: "pending",
        transaction_id: transactionId,
        metadata: {
          pixPayload,
          qrCodeUrl,
          copiaECola
        }
      }
    ]);
    if (paymentError) {
      console.error("Error saving payment information:", paymentError);
    }
    return new Response(JSON.stringify({
      pixQrCode: qrCodeUrl,
      pixCopiaECola: copiaECola,
      transactionId,
      amount: formattedAmount
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error creating PIX QR code:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
