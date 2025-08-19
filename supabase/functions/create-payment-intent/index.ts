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
      console.error("Auth error:", authError);
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
    const { amount, currency } = await req.json();
    if (!amount || !currency) {
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
    // Get the Stripe secret key from the database
    const { data: settings, error: settingsError } = await supabase.from("payment_settings").select("stripe_secret_key, stripe_test_mode").maybeSingle();
    if (settingsError) {
      console.error("Error fetching Stripe settings:", settingsError);
      return new Response(JSON.stringify({
        error: "Failed to fetch Stripe settings",
        details: settingsError.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (!settings || !settings.stripe_secret_key) {
      return new Response(JSON.stringify({
        error: "Stripe is not configured",
        details: "Please configure Stripe settings in the admin panel"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const stripeSecretKey = settings.stripe_secret_key;
    // Import Stripe
    const { Stripe } = await import("npm:stripe@13.10.0");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16"
    });
    // Get order details from the database
    const { data: orderData, error: orderError } = await supabase.from("order_totals").select("*").eq("user_id", user.id).maybeSingle();
    if (orderError) {
      console.error("Error fetching order:", orderError);
      return new Response(JSON.stringify({
        error: "Failed to fetch order details",
        details: orderError.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (!orderData) {
      return new Response(JSON.stringify({
        error: "No order found",
        details: "Please add items to your cart before proceeding to checkout"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Create a payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          user_id: user.id,
          order_id: orderData.id
        }
      });
      return new Response(JSON.stringify({
        clientSecret: paymentIntent.client_secret
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      return new Response(JSON.stringify({
        error: "Stripe error",
        details: stripeError.message || "Error creating payment intent"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
