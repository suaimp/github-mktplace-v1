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

  // Verificar o tipo de ambiente (test/live) baseado na chave
  const isTestMode = secret_key.includes('test');
  const basicAuth = "Basic " + btoa(secret_key + ":");
  
  console.log("[DEBUG PIX] Secret key configurada:", secret_key.substring(0, 6) + "..." + secret_key.slice(-4));
  console.log("[DEBUG PIX] Modo de teste detectado:", isTestMode);

  // Autenticação do usuário
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  console.log("[DEBUG PIX] Configuração Supabase:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    url: supabaseUrl
  });
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader ? authHeader.replace("Bearer ", "") : "";
  
  console.log("[DEBUG PIX] Autenticação:", {
    hasAuthHeader: !!authHeader,
    jwtLength: jwt?.length || 0,
    jwtPrefix: jwt ? jwt.substring(0, 20) + "..." : "VAZIO"
  });
  
  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  
  console.log("[DEBUG PIX] Resultado auth:", {
    hasUser: !!user,
    userId: user?.id,
    errorMessage: error?.message,
    errorName: error?.name
  });
  
  if (error || !user) {
    console.log("[ERROR PIX] Erro de autenticação:", { error, user });
    return new Response(JSON.stringify({ 
      error: 'Não autorizado',
      debug: {
        hasAuthHeader: !!authHeader,
        jwtLength: jwt?.length || 0,
        errorMessage: error?.message,
        errorName: error?.name,
        supabaseUrl,
        hasAnonKey: !!supabaseAnonKey
      }
    }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    console.log("[DEBUG PIX] Body recebido na edge function:", JSON.stringify(body));
    console.log("[DEBUG PIX] ===== INÍCIO DO PROCESSAMENTO PIX =====");

    const {
      amount,
      customer_name,
      customer_email,
      customer_document,
      order_items
    } = body;

    // Validação dos dados obrigatórios
    if (!amount) {
      return new Response(JSON.stringify({ error: 'Dados incompletos: amount é obrigatório' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validar e ajustar o valor (mínimo R$ 1,00 = 100 centavos)
    let amountInt;
    if (typeof amount === 'string') {
      amountInt = parseInt(amount.replace(/[^\d]/g, ''));
    } else {
      amountInt = Math.round(Number(amount));
    }
    
    console.log("[DEBUG PIX] Valor processado:", amountInt);
    
    if (isNaN(amountInt) || amountInt < 100) {
      return new Response(JSON.stringify({ 
        error: 'Valor inválido',
        debug: `Valor deve ser pelo menos R$ 1,00 (100 centavos). Recebido: ${amountInt}`
      }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validar CPF se fornecido
    let documentClean = "11144477735"; // CPF padrão de teste
    if (customer_document && customer_document.trim() !== '') {
      documentClean = customer_document.replace(/\D/g, '');
      if (documentClean.length !== 11) {
        return new Response(JSON.stringify({ 
          error: 'CPF inválido',
          debug: `CPF deve ter 11 dígitos. Recebido: ${documentClean.length} dígitos`
        }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // Mapear itens do carrinho ou usar item padrão
    let items = [];
    if (order_items && Array.isArray(order_items) && order_items.length > 0) {
      items = order_items.map((item: any, index: number) => ({
        amount: Math.round(Number(item.amount || item.price || (amountInt / order_items.length))),
        description: item.description || item.name || `Item ${index + 1}`,
        quantity: item.quantity || 1,
        code: item.code || item.product_id || `ITEM_${index + 1}`
      }));
    } else {
      // Item padrão se não houver itens específicos
      items = [{
        amount: amountInt,
        description: "Pedido Marketplace",
        quantity: 1,
        code: "ITEM_001"
      }];
    }

    console.log("[DEBUG PIX] Items processados:", JSON.stringify(items));

    // Payload para PIX conforme documentação Pagar.me
    const pagarmePayload = {
      items: items,
      payments: [
        {
          payment_method: 'pix',
          pix: {
            expires_in: 3600, // 1 hora em segundos
            additional_information: [
              {
                name: "Pedido",
                value: "Marketplace - Pagamento via PIX"
              }
            ]
          }
        }
      ],
      customer: {
        name: customer_name || "Cliente",
        email: customer_email || "cliente@exemplo.com",
        document: documentClean,
        document_type: "cpf",
        type: "individual",
        phones: {
          home_phone: {
            country_code: "55",
            area_code: "11", 
            number: "999999999"
          }
        }
      },
      metadata: {
        user_id: user.id,
        payment_method: "pix",
        created_at: new Date().toISOString()
      }
    };

    console.log("[DEBUG PIX] Payload PIX:", JSON.stringify(pagarmePayload, null, 2));

    try {
      const pagarmeRes = await fetch('https://api.pagar.me/core/v5/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth
        },
        body: JSON.stringify(pagarmePayload),
      });

      const pagarmeBodyRaw = await pagarmeRes.text();
      console.log("[DEBUG PIX] Status resposta:", pagarmeRes.status);
      console.log("[DEBUG PIX] Resposta PIX:", pagarmeBodyRaw);

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

      // LOGS DETALHADOS DA RESPOSTA PIX
      console.log("[DEBUG PIX] ===== RESPOSTA FINAL PAGAR.ME PIX =====");
      console.log("[DEBUG PIX] Status HTTP:", pagarmeRes.status);
      console.log("[DEBUG PIX] Status do pedido:", pagarmeData.status);
      console.log("[DEBUG PIX] ID do pedido:", pagarmeData.id);
      
      if (pagarmeData.charges && pagarmeData.charges.length > 0) {
        const charge = pagarmeData.charges[0];
        console.log("[DEBUG PIX] Status do charge:", charge.status);
        console.log("[DEBUG PIX] ID do charge:", charge.id);
        
        if (charge.last_transaction && charge.last_transaction.pix) {
          const pixData = charge.last_transaction.pix;
          console.log("[DEBUG PIX] QR Code:", pixData.qr_code);
          console.log("[DEBUG PIX] QR Code URL:", pixData.qr_code_url);
          console.log("[DEBUG PIX] Código PIX:", pixData.qr_code);
          console.log("[DEBUG PIX] Expira em:", pixData.expires_at);
        }
      }
      console.log("[DEBUG PIX] ===========================================");

      // Extrair dados do PIX da resposta
      let pixResponse = {
        order_id: pagarmeData.id,
        status: pagarmeData.status,
        qr_code: null,
        qr_code_url: null,
        expires_at: null,
        expires_in: 3600
      };

      if (pagarmeData.charges && pagarmeData.charges.length > 0) {
        const charge = pagarmeData.charges[0];
        if (charge.last_transaction && charge.last_transaction.pix) {
          const pixData = charge.last_transaction.pix;
          pixResponse.qr_code = pixData.qr_code;
          pixResponse.qr_code_url = pixData.qr_code_url;
          pixResponse.expires_at = pixData.expires_at;
        }
      }

      return new Response(JSON.stringify({
        success: true,
        ...pixResponse,
        raw_response: pagarmeData // Para debug, remover em produção
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      console.error("[ERROR PIX] Erro no pagamento PIX:", err);
      return new Response(JSON.stringify({ error: err.message || String(err) }), {
        status: 500,
        headers: corsHeaders,
      });
    }

  } catch (err) {
    console.error("[ERROR PIX] Erro geral:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
