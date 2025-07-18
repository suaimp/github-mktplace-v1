import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

serve(async (req) => {
  // TRATE O OPTIONS PRIMEIRO!
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
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
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({
      error: 'Variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY não configuradas',
      debug: { supabaseUrl, supabaseAnonKey }
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({
      error: 'Token de autenticação ausente ou mal formatado',
      debug: { hasAuthHeader: !!authHeader, authHeader }
    }), {
      status: 401,
      headers: corsHeaders,
    });
  }
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt || jwt.length < 10) {
    return new Response(JSON.stringify({
      error: 'Token JWT ausente ou inválido',
      debug: { jwtLength: jwt?.length || 0 }
    }), {
      status: 401,
      headers: corsHeaders,
    });
  }
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
    console.log('[DEBUG] Body recebido na edge function:', JSON.stringify(body));

    // TOKENIZAÇÃO - Primeiro passo do fluxo seguro
    if (body.action === 'tokenize') {
      const { card_number, card_exp_month, card_exp_year, card_cvv, card_holder_name } = body;
      if (!card_number || !card_exp_month || !card_exp_year || !card_cvv || !card_holder_name) {
        return new Response(JSON.stringify({ error: 'Dados do cartão incompletos para tokenização' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      // Montar payload conforme documentação v5 - SEM billing_address na tokenização
      const tokenPayload = {
        type: 'card',
        card: {
          number: card_number,
          exp_month: Number(card_exp_month),
          exp_year: Number(card_exp_year),
          cvv: card_cvv,
          holder_name: card_holder_name
          // billing_address NÃO é necessário na tokenização v5
        }
      };
      const tokenUrl = `https://api.pagar.me/core/v5/tokens?appId=${public_key}`;
      console.log('[DEBUG] URL de tokenização:', tokenUrl);
      console.log('[DEBUG] Payload enviado para tokenização Pagar.me:', JSON.stringify(tokenPayload));
      try {
        const tokenRes = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokenPayload)
        });
        const tokenData = await tokenRes.json();
        console.log('[DEBUG] Resposta da tokenização Pagar.me:', JSON.stringify(tokenData));
        if (!tokenRes.ok || !tokenData.id) {
          return new Response(JSON.stringify({ error: tokenData.message || 'Erro ao tokenizar cartão', details: tokenData }), {
            status: tokenRes.status,
            headers: corsHeaders,
          });
        }
        return new Response(JSON.stringify({ card_token: tokenData.id, success: true }), {
          status: 200,
          headers: corsHeaders,
        });
      } catch (err) {
        console.error('[ERROR] Erro na tokenização:', err);
        return new Response(JSON.stringify({ error: 'Erro inesperado na tokenização', details: String(err) }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // PAGAMENTO COM TOKEN - Segundo passo do fluxo seguro
    if (body.action === 'payment_with_token' || !body.action) {
      // Validar se os campos principais existem
      if (!body.items || !body.customer || !body.payments) {
        return new Response(JSON.stringify({ error: 'Payload de pagamento incompleto.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      // Log do payload recebido
      console.log('[DEBUG] Payload de pagamento recebido:', JSON.stringify(body));

      // Validação extra: garantir que billing_address está presente e completo
      const payment = body.payments?.[0]?.credit_card;
      const billingAddress = payment?.card?.billing_address;
      const requiredFields = ["line_1","zip_code","city","state","country"];
      let missingFields: string[] = [];
      if (!billingAddress || typeof billingAddress !== 'object') {
        missingFields = requiredFields;
      } else {
        missingFields = requiredFields.filter(f => !billingAddress[f] || typeof billingAddress[f] !== 'string' || billingAddress[f].length === 0);
      }
      if (missingFields.length > 0) {
        return new Response(JSON.stringify({
          error: 'Endereço de cobrança incompleto ou ausente.',
          missingFields,
          received: billingAddress
        }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      // Repassar diretamente para a Pagar.me
      const pagarmePayload = {
        items: body.items,
        customer: body.customer,
        payments: body.payments
      };
      console.log('[DEBUG] Payload enviado para Pagar.me:', JSON.stringify(pagarmePayload));

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
        
        if (!pagarmeRes.ok) {
          return new Response(JSON.stringify({ 
            error: pagarmeData.message || 'Erro ao processar pagamento',
            details: pagarmeData.errors || pagarmeData
          }), {
            status: pagarmeRes.status,
            headers: corsHeaders,
          });
        }
        
        // Após pagamento bem-sucedido
        const selected_installment = body.payments?.[0]?.credit_card?.installments;
        const status = pagarmeData.status || null;
        const id = pagarmeData.id || null;
        return new Response(JSON.stringify({
          success: true,
          selected_installment,
          request_id: crypto.randomUUID(),
          message: "Pagamento iniciado com sucesso",
          status,
          id
        }), {
          status: 200,
          headers: corsHeaders,
        });

      } catch (err) {
        console.error("[ERROR] Erro no pagamento:", err);
        return new Response(JSON.stringify({ error: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte." }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

  } catch (err) {
    console.error("[ERROR] Erro geral:", err);
    return new Response(JSON.stringify({ error: "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});