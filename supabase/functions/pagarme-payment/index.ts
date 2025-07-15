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

  // Configuração da API Pagar.me - Sistema híbrido para teste/produção
  const secret_key_prod = Deno.env.get('PAGARME'); // Chaves de produção (mantém as atuais)
  const public_key_prod = Deno.env.get('PAGARME_PUBLIC_KEY');
  const secret_key_test = Deno.env.get('PAGARME_TEST_SECRET'); // Novas chaves de teste
  const public_key_test = Deno.env.get('PAGARME_TEST_PUBLIC');
  
  // Verificar se pelo menos as chaves de produção existem
  if (!secret_key_prod || !public_key_prod) {
    return new Response(JSON.stringify({ 
      error: 'Chaves de produção não configuradas',
      debug: 'Variáveis PAGARME e PAGARME_PUBLIC_KEY não definidas'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!secret_key_prod.startsWith('sk_')) {
    return new Response(JSON.stringify({ 
      error: 'Secret key inválida',
      debug: 'Use uma chave secreta (sk_) na variável PAGARME'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!public_key_prod.startsWith('pk_')) {
    return new Response(JSON.stringify({ 
      error: 'Public key inválida',
      debug: 'Use uma chave pública (pk_) na variável PAGARME_PUBLIC_KEY'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Autenticação do usuário (precisa ser antes de buscar configurações)
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader ? authHeader.replace("Bearer ", "") : "";

  // Cria o client do Supabase já com o JWT do usuário nas headers globais
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser(jwt);
  if (error || !user) {
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

  // Buscar configuração do modo teste no banco
  const { data: settingsArr, error: settingsError } = await supabase
    .from("pagarme_settings")
    .select("pagarme_test_mode")
    .order("created_at", { ascending: true })
    .limit(1);
  const settings = settingsArr && settingsArr.length > 0 ? settingsArr[0] : null;

  // NOVO LOG: Mostra o valor lido do banco e se houve erro
  let logAlternancia = {
    settings,
    settingsError,
    pagarme_test_mode: settings?.pagarme_test_mode,
    defaultedTo: settings?.pagarme_test_mode === undefined ? 'true (default)' : 'valor do banco',
  };

  const useTestMode = settings?.pagarme_test_mode ?? true; // Default para teste

  // Selecionar chaves baseado na configuração
  let secret_key, public_key, ambiente;

  if (useTestMode && secret_key_test && public_key_test) {
    secret_key = secret_key_test;
    public_key = public_key_test;
    ambiente = 'TESTE';
  } else {
    secret_key = secret_key_prod;
    public_key = public_key_prod;
    ambiente = 'PRODUCAO';
  }

  // NOVO LOG: Mostra qual ambiente está sendo usado e as chaves (parcial)
  logAlternancia = {
    ...logAlternancia,
    useTestMode,
    ambiente,
    secret_key_inicio: secret_key.substring(0, 6),
    secret_key_fim: secret_key.slice(-4),
    public_key_inicio: public_key.substring(0, 6),
    public_key_fim: public_key.slice(-4),
  };

  // Substitui todos os logs antigos por um único log objetivo
  console.log('[ALTERNANCIA_PAGARME]', JSON.stringify(logAlternancia));

  const basicAuth = "Basic " + btoa(secret_key + ":");
  
  try {
    const body = await req.json();
    console.log("[DEBUG] Body recebido na edge function:", JSON.stringify(body));
    console.log("[DEBUG] Action solicitada:", body.action || 'payment_with_token (padrão)');

    // CHECK_KEYS - Verificar se as chaves estão configuradas
    if (body.action === 'check_keys') {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Chaves configuradas corretamente',
        test_mode: useTestMode,
        keys_configured: true
      }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // TOKENIZAÇÃO - Primeiro passo do fluxo seguro
    if (body.action === 'tokenize') {const { 
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
        const tokenUrl = `https://api.pagar.me/core/v5/tokens?appId=${public_key}`;console.log("[DEBUG] Chave pública enviada via appId:", public_key.substring(0, 10) + "...");console.log("[DEBUG] Dados do cartão para tokenização:", {
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
        });const tokenBodyRaw = await tokenRes.text();console.log("[DEBUG] Headers resposta:", Object.fromEntries(tokenRes.headers.entries()));let tokenData;
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
          let userMessage = "Ocorreu um erro ao processar o cartão.";
          if (tokenRes.status === 422 || (tokenData.message && tokenData.message.toLowerCase().includes("invalid"))) {
            userMessage = "Dados inválidos. Verifique as informações e tente novamente.";
          } else if (tokenData.message && tokenData.message.toLowerCase().includes("denied")) {
            userMessage = "Pagamento negado pelo gateway. Tente outro cartão ou método de pagamento.";
          } else if (tokenData.message) {
            userMessage = "Dados do cartão inválidos. Verifique as informações e tente novamente.";
          }
          return new Response(JSON.stringify({ 
            error: userMessage, 
            details: tokenData.errors || 'Erro na tokenização'
          }), {
            status: tokenRes.status,
            headers: corsHeaders,
          });
        }return new Response(JSON.stringify({ 
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
        return new Response(JSON.stringify({ error: 'Preencha todos os campos obrigatórios.' }), {
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
      }if (isNaN(amountInt) || amountInt < 100) {
        return new Response(JSON.stringify({ 
          error: 'Valor mínimo para pagamento é R$ 1,00.'
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
            error: 'CPF inválido. Verifique e tente novamente.'
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

        const pagarmeBodyRaw = await pagarmeRes.text();let pagarmeData;
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
        if (pagarmeData.charges && pagarmeData.charges.length > 0) {
          const charge = pagarmeData.charges[0];
          if (charge.last_transaction) {
            if (charge.last_transaction.gateway_response) {
              // Log adicional se necessário
            }
          }
        }
        
        if (!pagarmeRes.ok || (pagarmeData && pagarmeData.message && pagarmeData.message.toLowerCase().includes("denied"))) {
          return new Response(JSON.stringify({ 
            error: "Pagamento negado pelo gateway. Tente outro cartão ou método de pagamento."
          }), {
            status: pagarmeRes.status,
            headers: corsHeaders,
          });
        }
        
        return new Response(JSON.stringify(pagarmeData), {
          status: pagarmeRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        console.error("[ERROR] Erro no pagamento:", err);
        return new Response(JSON.stringify({ error: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte." }), {
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
    return new Response(JSON.stringify({ error: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});