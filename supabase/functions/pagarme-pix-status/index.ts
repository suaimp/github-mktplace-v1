import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  // TRATE O OPTIONS PRIMEIRO!
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Configuração da API Pagar.me
  const secret_key = Deno.env.get('PAGARME'); // Chave secreta (sk_) para pagamentos
  
  if (!secret_key) {
    console.log("ERRO: Variável PAGARME não encontrada no ambiente da Edge Function!");
    return new Response(JSON.stringify({ 
      error: 'Secret key não configurada',
      debug: 'Variável PAGARME não definida nas secrets do Supabase'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!secret_key.startsWith('sk_')) {
    console.log("ERRO: Chave PAGARME deve ser uma chave secreta (sk_)!");
    return new Response(JSON.stringify({ 
      error: 'Secret key inválida',
      debug: 'Use uma chave secreta (sk_) na variável PAGARME'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const basicAuth = "Basic " + btoa(secret_key + ":");
  
  console.log("[DEBUG PIX STATUS] Secret key configurada:", secret_key.substring(0, 6) + "..." + secret_key.slice(-4));

  // Autenticação do usuário
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader ? authHeader.replace("Bearer ", "") : "";
  
  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  
  if (error || !user) {
    console.log("[ERROR PIX STATUS] Erro de autenticação:", { error, user });
    return new Response(JSON.stringify({ 
      error: 'Não autorizado'
    }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    console.log("[DEBUG PIX STATUS] Body recebido:", JSON.stringify(body));
    
    const { order_id } = body;

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'order_id é obrigatório' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("[DEBUG PIX STATUS] Consultando status do pedido:", order_id);

    try {
      // Consultar status do pedido na Pagar.me
      const pagarmeRes = await fetch(`https://api.pagar.me/core/v5/orders/${order_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth
        }
      });

      const pagarmeBodyRaw = await pagarmeRes.text();
      console.log("[DEBUG PIX STATUS] Status HTTP:", pagarmeRes.status);
      console.log("[DEBUG PIX STATUS] Resposta:", pagarmeBodyRaw);

      let pagarmeData;
      try {
        pagarmeData = JSON.parse(pagarmeBodyRaw);
      } catch (e) {
        return new Response(JSON.stringify({ 
          error: 'Resposta inválida da Pagar.me', 
          raw: pagarmeBodyRaw 
        }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      if (!pagarmeRes.ok) {
        return new Response(JSON.stringify({ 
          error: 'Erro ao consultar status do pedido', 
          details: pagarmeData 
        }), {
          status: pagarmeRes.status,
          headers: corsHeaders,
        });
      }

      // Extrair informações relevantes
      const orderStatus = pagarmeData.status;
      let paymentStatus = 'pending';
      let transactionData = null;

      if (pagarmeData.charges && pagarmeData.charges.length > 0) {
        const charge = pagarmeData.charges[0];
        paymentStatus = charge.status;
        
        if (charge.last_transaction) {
          transactionData = {
            id: charge.last_transaction.id,
            status: charge.last_transaction.status,
            amount: charge.last_transaction.amount,
            paid_amount: charge.last_transaction.paid_amount,
            created_at: charge.last_transaction.created_at,
            updated_at: charge.last_transaction.updated_at
          };
          
          if (charge.last_transaction.pix) {
            transactionData.pix = {
              qr_code: charge.last_transaction.pix.qr_code,
              qr_code_url: charge.last_transaction.pix.qr_code_url,
              expires_at: charge.last_transaction.pix.expires_at
            };
          }
        }
      }

      console.log("[DEBUG PIX STATUS] Status processado:", {
        order_id: pagarmeData.id,
        order_status: orderStatus,
        payment_status: paymentStatus,
        has_transaction: !!transactionData
      });

      // Determinar se o pagamento foi aprovado
      const isPaid = orderStatus === 'paid' || paymentStatus === 'paid';
      const isFailed = orderStatus === 'failed' || paymentStatus === 'failed';

      return new Response(JSON.stringify({
        success: true,
        order_id: pagarmeData.id,
        order_status: orderStatus,
        payment_status: paymentStatus,
        is_paid: isPaid,
        is_failed: isFailed,
        transaction: transactionData,
        full_response: pagarmeData // Para debug, remover em produção
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      console.error("[ERROR PIX STATUS] Erro ao consultar status:", err);
      return new Response(JSON.stringify({ error: err.message || String(err) }), {
        status: 500,
        headers: corsHeaders,
      });
    }

  } catch (err) {
    console.error("[ERROR PIX STATUS] Erro geral:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
