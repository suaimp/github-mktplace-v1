import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
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
    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({
        error: "No Stripe signature found"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Get the raw body
    const body = await req.text();
    // Get the Stripe secret key from the database
    const { data: settings, error: settingsError } = await supabase.from("payment_settings").select("stripe_secret_key").single();
    if (settingsError) {
      console.error("Error fetching Stripe settings:", settingsError);
      return new Response(JSON.stringify({
        error: "Failed to fetch Stripe settings"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const stripeSecretKey = settings.stripe_secret_key;
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({
        error: "Stripe is not properly configured"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Import Stripe
    const { Stripe } = await import("npm:stripe@13.10.0");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16"
    });
    // Verify the webhook signature using the environment variable
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({
        error: `Webhook signature verification failed: ${err.message}`
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    // Handle the event
    switch(event.type){
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Update payment status in the database
        if (paymentIntent.metadata && paymentIntent.metadata.user_id) {
          const { error: paymentError } = await supabase.from("payments").insert([
            {
              user_id: paymentIntent.metadata.user_id,
              order_id: paymentIntent.metadata.order_id,
              payment_method: "card",
              amount: paymentIntent.amount / 100,
              status: "completed",
              transaction_id: paymentIntent.id,
              metadata: paymentIntent
            }
          ]);
          if (paymentError) {
            console.error("Error updating payment status:", paymentError);
          }
        }
        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        console.log(`Payment failed: ${failedPaymentIntent.last_payment_error?.message}`);
        // Update payment status in the database
        if (failedPaymentIntent.metadata && failedPaymentIntent.metadata.user_id) {
          const { error: paymentError } = await supabase.from("payments").insert([
            {
              user_id: failedPaymentIntent.metadata.user_id,
              order_id: failedPaymentIntent.metadata.order_id,
              payment_method: "card",
              amount: failedPaymentIntent.amount / 100,
              status: "failed",
              transaction_id: failedPaymentIntent.id,
              metadata: {
                error: failedPaymentIntent.last_payment_error,
                payment_intent: failedPaymentIntent
              }
            }
          ]);
          if (paymentError) {
            console.error("Error updating payment status:", paymentError);
          }
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
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
