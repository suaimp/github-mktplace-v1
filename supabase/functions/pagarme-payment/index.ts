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
  const public_key = Deno.env.get('PAGARME_PUBLIC_KEY'); // Chave pública (pk_) para tokenização
  
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

  if (!public_key) {
    console.log("ERRO: Variável PAGARME_PUBLIC_KEY não encontrada no ambiente da Edge Function!");
    return new Response(JSON.stringify({ 
      error: 'Public key não configurada',
      debug: 'Variável PAGARME_PUBLIC_KEY não definida nas secrets do Supabase'
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

  if (!public_key.startsWith('pk_')) {
    console.log("ERRO: Chave PAGARME_PUBLIC_KEY deve ser uma chave pública (pk_)!");
    return new Response(JSON.stringify({ 
      error: 'Public key inválida',
      debug: 'Use uma chave pública (pk_) na variável PAGARME_PUBLIC_KEY'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Verificar o tipo de ambiente (test/live) baseado na chave
  const isTestMode = secret_key.includes('test');
  const basicAuth = "Basic " + btoa(secret_key + ":");
  
  console.log("[DEBUG] Secret key configurada:", secret_key.substring(0, 6) + "..." + secret_key.slice(-4));
  console.log("[DEBUG] Public key configurada:", public_key.substring(0, 6) + "..." + public_key.slice(-4));
  console.log("[DEBUG] Modo de teste detectado:", isTestMode);

  // Autenticação do usuário
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  console.log("[DEBUG] Configuração Supabase:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    url: supabaseUrl
  });
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader ? authHeader.replace("Bearer ", "") : "";
  
  console.log("[DEBUG] Autenticação:", {
    hasAuthHeader: !!authHeader,
    jwtLength: jwt?.length || 0,
    jwtPrefix: jwt ? jwt.substring(0, 20) + "..." : "VAZIO"
  });
  
  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  
  console.log("[DEBUG] Resultado auth:", {
    hasUser: !!user,
    userId: user?.id,
    errorMessage: error?.message,
    errorName: error?.name
  });
  
  if (error || !user) {
    console.log("[ERROR] Erro de autenticação:", { error, user });
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
    console.log("[DEBUG] Body recebido na edge function:", JSON.stringify(body));
    console.log("[DEBUG] ===== INÍCIO DO PROCESSAMENTO =====");
    console.log("[DEBUG] Action solicitada:", body.action || 'payment_with_token (padrão)');

    // TOKENIZAÇÃO - Primeiro passo do fluxo seguro
    if (body.action === 'tokenize') {
      console.log("[DEBUG] ===== INICIANDO TOKENIZAÇÃO =====");
      const { 
        card_number, 
        card_exp_month, 
        card_exp_year, 
        card_cvv, 
        card_holder_name,
        billing_address 
      } = body;
      
      if (!card_number || !card_exp_month || !card_exp_year || !card_cvv || !card_holder_name) {
        return new Response(JSON.stringify({ error: 'Dados do cartão incompletos para tokenização' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      console.log("[DEBUG] Iniciando tokenização com chave pública (conforme documentação)...");
      
      // Preparar o billing_address seguindo EXATAMENTE o padrão da documentação oficial da Pagar.me
      // Ref: https://docs.pagar.me/reference/endereços - zip_code deve ser INTEGER
      const defaultBillingAddress = {
        line_1: "Rua das Flores, 123",
        zip_code: 1234567, // INTEGER conforme documentação
        city: "São Paulo",
        state: "SP", // Sigla do estado  
        country: "BR" // Sempre BR para Brasil
      };

      // Validar e garantir que o billing_address tenha todos os campos obrigatórios conforme documentação
      let finalBillingAddress = defaultBillingAddress;
      
      if (billing_address && typeof billing_address === 'object') {
        // Tratar zip_code que pode vir como string ou number
        let zipCodeClean = '01234567';
        if (billing_address.zip_code) {
          if (typeof billing_address.zip_code === 'number') {
            zipCodeClean = billing_address.zip_code.toString();
          } else if (typeof billing_address.zip_code === 'string') {
            zipCodeClean = billing_address.zip_code.replace(/\D/g, '');
          }
        }
        
        finalBillingAddress = {
          line_1: (billing_address.line_1 && billing_address.line_1.trim() !== '') ? billing_address.line_1 : defaultBillingAddress.line_1,
          zip_code: zipCodeClean ? parseInt(zipCodeClean) : defaultBillingAddress.zip_code, // Converter para INTEGER
          city: (billing_address.city && billing_address.city.trim() !== '') ? billing_address.city : defaultBillingAddress.city,
          state: (billing_address.state && billing_address.state.trim() !== '') ? billing_address.state : defaultBillingAddress.state,
          country: "BR" // Sempre BR conforme documentação
        };
      }
      
      try {
        // IMPORTANTE: Para tokenização, usar chave pública como query parameter appId
        // Conforme documentação: https://docs.pagar.me/reference/pagarme-js
        const tokenUrl = `https://api.pagar.me/core/v5/tokens?appId=${public_key}`;
        
        console.log("[DEBUG] URL de tokenização:", tokenUrl);
        console.log("[DEBUG] Chave pública enviada via appId:", public_key.substring(0, 10) + "...");
        console.log("[DEBUG] Billing address recebido:", billing_address);
        console.log("[DEBUG] Billing address final usado:", finalBillingAddress);
        console.log("[DEBUG] Dados do cartão para tokenização:", {
          number: card_number ? card_number.substring(0, 4) + '****' : 'VAZIO',
          exp_month: card_exp_month,
          exp_year: card_exp_year,
          cvv: card_cvv ? '***' : 'VAZIO',
          holder_name: card_holder_name
        });
        
        const tokenRes = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // ATENÇÃO: Para tokenização, NÃO usar Authorization header!
          },
          body: JSON.stringify({
            type: 'card',
            card: {
              number: card_number,
              exp_month: parseInt(card_exp_month),
              exp_year: parseInt(card_exp_year),
              cvv: card_cvv,
              holder_name: card_holder_name,
              billing_address: finalBillingAddress
            }
          })
        });

        console.log("[DEBUG] ===== RESPOSTA DA TOKENIZAÇÃO =====");
        const tokenBodyRaw = await tokenRes.text();
        console.log("[DEBUG] Status tokenização:", tokenRes.status);
        console.log("[DEBUG] Headers resposta:", Object.fromEntries(tokenRes.headers.entries()));
        console.log("[DEBUG] Resposta tokenização:", tokenBodyRaw);
        console.log("[DEBUG] ========================================");

        let tokenData;
        try {
          tokenData = JSON.parse(tokenBodyRaw);
        } catch (e) {
          return new Response(JSON.stringify({ 
            error: 'Resposta inválida da Pagar.me', 
            raw: tokenBodyRaw 
          }), {
            status: 500,
            headers: corsHeaders,
          });
        }

        if (!tokenRes.ok || !tokenData.id) {
          console.log("[ERROR] Falha na tokenização:", tokenData);
          return new Response(JSON.stringify({ 
            error: tokenData.message || 'Erro ao tokenizar cartão', 
            details: tokenData.errors || 'Erro na tokenização',
            raw: tokenBodyRaw 
          }), {
            status: tokenRes.status,
            headers: corsHeaders,
          });
        }

        console.log("[DEBUG] Tokenização bem-sucedida, token:", tokenData.id);
        return new Response(JSON.stringify({ 
          card_token: tokenData.id,
          success: true 
        }), {
          status: 200,
          headers: corsHeaders,
        });

      } catch (err) {
        console.error("[ERROR] Erro na tokenização:", err);
        return new Response(JSON.stringify({ error: err.message || String(err) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // PAGAMENTO COM TOKEN - Segundo passo do fluxo seguro
    if (body.action === 'payment_with_token' || !body.action) {
      const {
        amount,
        card_token,
        customer_name,
        customer_email,
        customer_document,
        billing_address
      } = body;

      // Validação dos dados obrigatórios
      if (!amount || !card_token) {
        return new Response(JSON.stringify({ error: 'Dados incompletos: amount e card_token são obrigatórios' }), {
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
      
      console.log("[DEBUG] Valor processado:", amountInt);
      
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

      // Preparar billing_address para o pagamento (também necessário aqui)
      const defaultBillingAddress = {
        line_1: "Rua das Flores, 123",
        zip_code: "01234567", // String no pagamento conforme exemplos da documentação
        city: "São Paulo",
        state: "SP",
        country: "BR"
      };

      let finalBillingAddress = defaultBillingAddress;
      
      if (billing_address && typeof billing_address === 'object') {
        let zipCodeClean = '01234567';
        if (billing_address.zip_code) {
          if (typeof billing_address.zip_code === 'number') {
            zipCodeClean = billing_address.zip_code.toString();
          } else if (typeof billing_address.zip_code === 'string') {
            zipCodeClean = billing_address.zip_code.replace(/\D/g, '');
          }
        }
        
        finalBillingAddress = {
          line_1: (billing_address.line_1 && billing_address.line_1.trim() !== '') ? billing_address.line_1 : defaultBillingAddress.line_1,
          zip_code: zipCodeClean || defaultBillingAddress.zip_code, // String no pagamento
          city: (billing_address.city && billing_address.city.trim() !== '') ? billing_address.city : defaultBillingAddress.city,
          state: (billing_address.state && billing_address.state.trim() !== '') ? billing_address.state : defaultBillingAddress.state,
          country: "BR"
        };
      }

      console.log("[DEBUG] billing_address final usado no pagamento:", JSON.stringify(finalBillingAddress));
      
      const pagarmePayload = {
        items: [
          {
            amount: amountInt,
            description: "Pedido Marketplace",
            quantity: 1,
            code: "ITEM_001"
          }
        ],
        payments: [
          {
            payment_method: 'credit_card',
            credit_card: {
              installments: 1,
              statement_descriptor: "MARKETPLACE",
              card_token: card_token,
              card: {
                billing_address: finalBillingAddress
              }
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
        }
      };

      console.log("[DEBUG] Payload pagamento:", JSON.stringify(pagarmePayload, null, 2));

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
        console.log("[DEBUG] Status pagamento:", pagarmeRes.status);
        console.log("[DEBUG] Resposta pagamento:", pagarmeBodyRaw);

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

        // LOGS DETALHADOS DA RESPOSTA FINAL
        console.log("[DEBUG] ===== RESPOSTA FINAL PAGAR.ME =====");
        console.log("[DEBUG] Status HTTP:", pagarmeRes.status);
        console.log("[DEBUG] Status do pedido:", pagarmeData.status);
        console.log("[DEBUG] ID do pedido:", pagarmeData.id);
        
        if (pagarmeData.charges && pagarmeData.charges.length > 0) {
          const charge = pagarmeData.charges[0];
          console.log("[DEBUG] Status do charge:", charge.status);
          console.log("[DEBUG] ID do charge:", charge.id);
          
          if (charge.last_transaction) {
            console.log("[DEBUG] Status da transação:", charge.last_transaction.status);
            console.log("[DEBUG] Código de resposta:", charge.last_transaction.acquirer_return_code);
            console.log("[DEBUG] Mensagem:", charge.last_transaction.acquirer_message);
            
            if (charge.last_transaction.gateway_response) {
              console.log("[DEBUG] Resposta do gateway:", charge.last_transaction.gateway_response);
            }
          }
        }
        console.log("[DEBUG] =====================================");

        return new Response(JSON.stringify(pagarmeData), {
          status: pagarmeRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        console.error("[ERROR] Erro no pagamento:", err);
        return new Response(JSON.stringify({ error: err.message || String(err) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // Ação não reconhecida
    return new Response(JSON.stringify({ 
      error: 'Ação não reconhecida',
      supportedActions: ['tokenize', 'payment_with_token']
    }), {
      status: 400,
      headers: corsHeaders,
    });

  } catch (err) {
    console.error("[ERROR] Erro geral:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});