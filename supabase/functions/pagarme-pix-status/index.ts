import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 1. Configuração da API Pagar.me
  const secret_key = Deno.env.get('PAGARME');
  if (!secret_key) {
    return new Response(JSON.stringify({ error: 'Secret key da Pagar.me não configurada' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const basicAuth = "Basic " + btoa(secret_key + ":");
  const isTestMode = secret_key.includes('test');

  try {
    const { order_id } = await req.json();

    // 2. Validação do order_id
    if (!order_id || !order_id.startsWith('or_')) {
      return new Response(JSON.stringify({ error: 'order_id inválido ou ausente' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[PIX STATUS] Consultando pedido: ${order_id} em ambiente ${isTestMode ? 'SANDBOX' : 'PRODUÇÃO'}`);

    // 3. Consultar o pedido na Pagar.me
    const orderResponse = await fetch(`https://api.pagar.me/core/v5/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth
      }
    });

    if (!orderResponse.ok) {
      const errorBody = await orderResponse.text();
      console.error(`[PIX STATUS] Erro ao consultar Pagar.me para ${order_id}:`, errorBody);
      return new Response(JSON.stringify({ 
        error: 'Falha ao consultar o pedido na Pagar.me',
        status: orderResponse.status,
        details: errorBody
      }), {
        status: orderResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderData = await orderResponse.json();
    console.log(`[PIX STATUS] Resposta da Pagar.me para ${order_id}:`, JSON.stringify(orderData, null, 2));

    // 4. Extrair os dados do QR Code
    let qrCodeData = null;
    if (orderData.charges && orderData.charges.length > 0) {
      const charge = orderData.charges[0];
      if (charge.last_transaction && charge.last_transaction.pix) {
        const pix = charge.last_transaction.pix;
        if (pix.qr_code && pix.qr_code_url) {
          qrCodeData = {
            qr_code: pix.qr_code,
            qr_code_url: pix.qr_code_url,
            expires_at: pix.expires_at,
          };
          console.log(`[PIX STATUS] QR Code ENCONTRADO para ${order_id}`);
        }
      }
    }

    // 5. Retornar a resposta
    if (qrCodeData) {
      return new Response(JSON.stringify({
        status: 'found',
        ...qrCodeData,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log(`[PIX STATUS] QR Code AINDA PENDENTE para ${order_id}`);
      return new Response(JSON.stringify({
        status: 'pending',
        order_status: orderData.status,
        charge_status: orderData.charges?.[0]?.status || 'N/A',
      }), {
        status: 202, // 202 Accepted: A requisição foi aceita, mas o processamento não terminou.
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (err) {
    console.error("[PIX STATUS] Erro geral:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
