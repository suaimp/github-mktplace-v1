import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
};
serve(async (req)=>{
  // TRATE O OPTIONS PRIMEIRO!
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  // --- LER O BODY UMA ÚNICA VEZ ---
  let body;
  try {
    body = await req.json();
  } catch (e) {
    body = null;
  }
  // --- REMOVIDO: TRATAMENTO DE WEBHOOK PAGAR.ME ---
  // (Toda a lógica de eventos como charge.paid foi removida deste endpoint)
  // --- FLUXO NORMAL DE GERAÇÃO DE QR CODE PIX ---
  if (!body) {
    return new Response(JSON.stringify({
      error: 'Body não enviado'
    }), {
      status: 400,
      headers: corsHeaders
    });
  }
  // Novo: pegar o order_id do body, se enviado
  const { order_id } = body;
  // Configuração da API Pagar.me
  const secret_key = Deno.env.get('PAGARME'); // Chave secreta (sk_) para pagamentos
  if (!secret_key) {
    console.log("ERRO: Variável PAGARME não encontrada no ambiente da Edge Function!");
    return new Response(JSON.stringify({
      error: 'Secret key não configurada',
      debug: 'Variável PAGARME não definida nas secrets do Supabase'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
  if (!secret_key.startsWith('sk_')) {
    console.log("ERRO: Chave PAGARME deve ser uma chave secreta (sk_)!");
    return new Response(JSON.stringify({
      error: 'Secret key inválida',
      debug: 'Use uma chave secreta (sk_) na variável PAGARME'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
  // Verificar o tipo de ambiente (test/live) baseado na chave
  const isTestMode = secret_key.includes('test');
  const basicAuth = "Basic " + btoa(secret_key + ":");
  console.log("[DEBUG PIX] ===== CONFIGURAÇÃO DA CHAVE =====");
  console.log("[DEBUG PIX] Secret key configurada:", secret_key.substring(0, 15) + "..." + secret_key.slice(-8));
  console.log("[DEBUG PIX] Modo de teste detectado:", isTestMode);
  console.log("[DEBUG PIX] 🚨 AMBIENTE:", isTestMode ? "SANDBOX/TEST" : "🔴 PRODUÇÃO REAL 🔴");
  console.log("[DEBUG PIX] Prefixo da chave:", secret_key.substring(0, 8));
  console.log("[DEBUG PIX] Chave contém 'test':", secret_key.includes('test'));
  console.log("[DEBUG PIX] Chave contém 'live':", secret_key.includes('live'));
  if (!isTestMode) {
    console.log("[🔴 PRODUÇÃO] ===== MODO PRODUÇÃO ATIVO =====");
    console.log("[🔴 PRODUÇÃO] Processando transações REAIS");
    console.log("[🔴 PRODUÇÃO] Delays ajustados para 45s (QR Code gerado em ~60s)");
    console.log("[🔴 PRODUÇÃO] Sem limitação de valor");
    console.log("[🔴 PRODUÇÃO] ================================");
  }
  console.log("[DEBUG PIX] =====================================");
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
    console.log("[ERROR PIX] Erro de autenticação:", {
      error,
      user
    });
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
      headers: corsHeaders
    });
  }
  try {
    console.log("[DEBUG PIX] Body recebido na edge function:", JSON.stringify(body));
    console.log("[DEBUG PIX] ===== INÍCIO DO PROCESSAMENTO PIX =====");
    const { 
      amount, 
      customer_name, 
      customer_email, 
      customer_document, 
      customer_phone, 
      customer_legal_status, 
      customer_company_name, 
      order_items 
    } = body;

    // Determinar se é cliente pessoa jurídica baseado no legal_status
    const isBusinessCustomer = customer_legal_status === "business";
    const document_type = isBusinessCustomer ? "cnpj" : "cpf";
    const customer_type = isBusinessCustomer ? "company" : "individual";
    const documentTypeName = isBusinessCustomer ? "CNPJ" : "CPF";
    const expectedDocumentLength = isBusinessCustomer ? 14 : 11;
    // Validação dos dados obrigatórios
    if (!amount || !customer_name || !customer_email || !customer_document) {
      return new Response(JSON.stringify({
        error: 'Dados incompletos',
        required: [
          'amount',
          'customer_name',
          'customer_email',
          'customer_document'
        ],
        received: {
          amount,
          customer_name,
          customer_email,
          customer_document
        }
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Validar e ajustar o valor (mínimo R$ 0,50 = 50 centavos)
    let amountInt;
    if (typeof amount === 'string') {
      // Remove todos caracteres não numéricos e converte para número
      const cleanAmount = amount.replace(/[^\d,\.]/g, '');
      // Se tem vírgula, troca por ponto para conversão
      const normalizedAmount = cleanAmount.replace(',', '.');
      amountInt = Math.round(parseFloat(normalizedAmount) * 100);
    } else {
      amountInt = Math.round(Number(amount));
    }
    console.log("[DEBUG PIX] Valor original:", amount);
    console.log("[DEBUG PIX] Valor processado (centavos):", amountInt);
    console.log("[DEBUG PIX] Valor em reais:", amountInt / 100);
    console.log("[DEBUG PIX] Ambiente:", isTestMode ? "SANDBOX" : "PRODUÇÃO");
    // VALIDAÇÃO DE VALOR PARA PRODUÇÃO vs SANDBOX
    if (isTestMode) {
      // Sandbox: valores até R$ 500 são aprovados automaticamente
      if (isNaN(amountInt) || amountInt < 50) {
        return new Response(JSON.stringify({
          error: 'Valor inválido para sandbox',
          debug: `Valor deve ser pelo menos R$ 0,50. Recebido: ${amount} -> ${amountInt} centavos`
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      if (amountInt > 50000) {
        console.log("[WARNING PIX] Valor acima de R$ 500 no sandbox pode falhar");
      }
    } else {
      // PRODUÇÃO: sem limite superior, mas mínimo R$ 0,50
      if (isNaN(amountInt) || amountInt < 50) {
        return new Response(JSON.stringify({
          error: 'Valor inválido para produção',
          debug: `Valor deve ser pelo menos R$ 0,50. Recebido: ${amount} -> ${amountInt} centavos`
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      console.log("[INFO PIX] PRODUÇÃO - Processando valor:", `R$ ${(amountInt / 100).toFixed(2)}`);
    }
    // Validar e limpar documento (CPF ou CNPJ baseado no legal_status)
    let documentClean = customer_document.replace(/\D/g, "");
    
    if (documentClean.length !== expectedDocumentLength) {
      return new Response(JSON.stringify({
        error: `${documentTypeName} inválido`,
        debug: `${documentTypeName} deve ter ${expectedDocumentLength} dígitos. Recebido: ${customer_document} -> ${documentClean} (${documentClean.length} dígitos)`,
        legal_status: customer_legal_status,
        expected_document_type: document_type
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // Validar e limpar telefone
    let phoneClean = customer_phone ? customer_phone.replace(/\D/g, "") : "11987654321";
    if (phoneClean.length < 10) {
      phoneClean = "11987654321"; // Telefone padrão se não fornecido ou inválido
    }
    // Validar se o telefone tem pelo menos 10 dígitos para separar área corretamente
    let areaCode = "11";
    let phoneNumber = "987654321";
    if (phoneClean.length >= 10) {
      areaCode = phoneClean.substring(0, 2);
      phoneNumber = phoneClean.substring(2);
    }
    console.log("[DEBUG PIX] Dados do cliente processados:", {
      name: customer_name,
      email: customer_email,
      document: documentClean,
      phone: phoneClean,
      areaCode: areaCode,
      phoneNumber: phoneNumber,
      legal_status: customer_legal_status,
      company_name: customer_company_name
    });

    // Usar as variáveis já declaradas no início
    const customer_display_name = isBusinessCustomer && customer_company_name ? customer_company_name : customer_name;

    console.log("[DEBUG PIX] Configuração do cliente:", {
      legal_status: customer_legal_status,
      document_type: document_type,
      customer_type: customer_type,
      customer_display_name: customer_display_name,
      isBusinessCustomer: isBusinessCustomer
    });
    // Mapear itens do carrinho ou usar item padrão
    let items = [];
    if (order_items && Array.isArray(order_items) && order_items.length > 0) {
      items = order_items.map((item, index)=>({
          amount: Math.round(Number(item.amount || item.price || amountInt / order_items.length)),
          description: item.description || item.name || `Item ${index + 1}`,
          quantity: item.quantity || 1,
          code: item.code || item.product_id || `ITEM_${index + 1}`
        }));
    } else {
      // Item padrão se não houver itens específicos
      items = [
        {
          amount: amountInt,
          description: "Pedido Marketplace",
          quantity: 1,
          code: "ITEM_001"
        }
      ];
    }
    console.log("[DEBUG PIX] Items processados:", JSON.stringify(items));
    // Payload para PIX conforme documentação Pagar.me
    // IMPORTANTE: Para PIX funcionar corretamente, o customer precisa ter address
    const pagarmePayload = {
      items: items,
      payments: [
        {
          payment_method: 'pix',
          pix: {
            expires_in: 3600,
            additional_information: [
              {
                name: "Beneficiário",
                value: "SUA IMPRENSA LTDA"
              },
              {
                name: "CNPJ",
                value: "37.982.508/0001-42"
              },
              {
                name: "Pedido",
                value: `Marketplace PIX - Pedido ${new Date().toISOString()}`
              }
            ]
          }
        }
      ],
      customer: {
        name: customer_display_name,
        email: customer_email,
        document: documentClean,
        document_type: document_type,
        type: customer_type,
        address: {
          line_1: "Rua das Flores, 123",
          line_2: "Apto 101",
          zip_code: parseInt("01234567"),
          city: "São Paulo",
          state: "SP",
          country: "BR"
        },
        phones: {
          home_phone: {
            country_code: "55",
            area_code: areaCode,
            number: phoneNumber
          },
          mobile_phone: {
            country_code: "55",
            area_code: areaCode,
            number: phoneNumber
          }
        }
      },
      metadata: {
        user_id: user.id,
        payment_method: "pix",
        created_at: new Date().toISOString(),
        environment: isTestMode ? "test" : "production"
      }
    };
    console.log("[DEBUG PIX] Payload PIX:", JSON.stringify(pagarmePayload, null, 2));
    // VALIDAÇÃO FINAL DOS CAMPOS OBRIGATÓRIOS ANTES DE ENVIAR
    const customerValidation = pagarmePayload.customer;
    const pixValidation = pagarmePayload.payments[0].pix;
    console.log("[DEBUG PIX] ===== VALIDAÇÃO CAMPOS OBRIGATÓRIOS =====");
    console.log("[DEBUG PIX] customer.name:", customerValidation.name);
    console.log("[DEBUG PIX] customer.email:", customerValidation.email);
    console.log("[DEBUG PIX] customer.document:", customerValidation.document);
    console.log("[DEBUG PIX] customer.document_type:", customerValidation.document_type);
    console.log("[DEBUG PIX] customer.type:", customerValidation.type);
    console.log("[DEBUG PIX] customer.phones.home_phone:", JSON.stringify(customerValidation.phones.home_phone));
    console.log("[DEBUG PIX] pix.expires_in:", pixValidation.expires_in);
    console.log("[DEBUG PIX] payment_method:", pagarmePayload.payments[0].payment_method);
    console.log("[DEBUG PIX] items count:", pagarmePayload.items?.length || 0);
    console.log("[DEBUG PIX] legal_status enviado:", customer_legal_status);
    console.log("[DEBUG PIX] document_type determinado:", document_type);
    console.log("[DEBUG PIX] customer_type determinado:", customer_type);
    console.log("[DEBUG PIX] ===============================================");
    // Validação adicional dos campos obrigatórios
    if (!customerValidation.name || !customerValidation.email || !customerValidation.document || !customerValidation.document_type || !pixValidation.expires_in) {
      return new Response(JSON.stringify({
        error: 'Campos obrigatórios ausentes no payload',
        missing_fields: {
          name: !customerValidation.name,
          email: !customerValidation.email,
          document: !customerValidation.document,
          document_type: !customerValidation.document_type,
          expires_in: !pixValidation.expires_in
        }
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    try {
      const pagarmeRes = await fetch('https://api.pagar.me/core/v5/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': basicAuth
        },
        body: JSON.stringify(pagarmePayload)
      });
      const pagarmeBodyRaw = await pagarmeRes.text();
      console.log("[DEBUG PIX] Status resposta:", pagarmeRes.status);
      console.log("[DEBUG PIX] Resposta PIX:", pagarmeBodyRaw);
      let pagarmeData;
      try {
        pagarmeData = JSON.parse(pagarmeBodyRaw);
      } catch (e) {
        console.error("[ERROR PIX] Erro ao fazer parse da resposta:", e);
        console.error("[ERROR PIX] Resposta raw da Pagar.me:", pagarmeBodyRaw);
        return new Response(JSON.stringify({
          error: 'Resposta inválida da Pagar.me',
          raw: pagarmeBodyRaw
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
      // LOGS DETALHADOS DA RESPOSTA PIX
      console.log("[DEBUG PIX] ===== RESPOSTA FINAL PAGAR.ME PIX =====");
      console.log("[DEBUG PIX] Status HTTP:", pagarmeRes.status);
      console.log("[DEBUG PIX] Resposta completa:", JSON.stringify(pagarmeData, null, 2));
      console.log("[DEBUG PIX] Status do pedido:", pagarmeData.status);
      console.log("[DEBUG PIX] ID do pedido:", pagarmeData.id);
      // NOVO: Atualizar o payment_id no pedido se order_id e charge_id existirem
      if (order_id && pagarmeData.charges && pagarmeData.charges.length > 0) {
        const chargeId = pagarmeData.charges[0].id;
        if (chargeId) {
          try {
            const { error: updateError } = await supabase.from("orders").update({
              payment_id: chargeId
            }).eq("id", order_id);
            if (updateError) {
              console.error("[ERROR PIX] Falha ao atualizar payment_id no pedido:", updateError);
            } else {
              console.log(`[DEBUG PIX] payment_id (${chargeId}) atualizado para order_id ${order_id}`);
            }
          } catch (err) {
            console.error("[ERROR PIX] Erro ao atualizar payment_id no pedido:", err);
          }
        }
      }
      // VERIFICAR SE HÁ ERROS NA RESPOSTA
      if (pagarmeData.errors && pagarmeData.errors.length > 0) {
        console.error("[ERROR PIX] Erros retornados pela Pagar.me:", JSON.stringify(pagarmeData.errors, null, 2));
        const errorMessages = pagarmeData.errors.map((err)=>err.message || err.type || 'Erro desconhecido').join(', ');
        return new Response(JSON.stringify({
          error: `Erro da Pagar.me: ${errorMessages}`,
          pagarme_errors: pagarmeData.errors,
          raw_response: pagarmeData
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      // VERIFICAR SE A RESPOSTA TEM STATUS DE ERRO HTTP
      if (!pagarmeRes.ok) {
        console.error("[ERROR PIX] Status HTTP de erro:", pagarmeRes.status);
        console.error("[ERROR PIX] Resposta de erro:", JSON.stringify(pagarmeData, null, 2));
        return new Response(JSON.stringify({
          error: `Erro HTTP ${pagarmeRes.status} da Pagar.me`,
          http_status: pagarmeRes.status,
          pagarme_response: pagarmeData
        }), {
          status: pagarmeRes.status,
          headers: corsHeaders
        });
      }
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
      // VERIFICAÇÃO MAIS ROBUSTA DA ESTRUTURA DA RESPOSTA
      console.log("[DEBUG PIX] ===== ANÁLISE ESTRUTURA RESPOSTA =====");
      console.log("[DEBUG PIX] pagarmeData.charges existe:", !!pagarmeData.charges);
      console.log("[DEBUG PIX] pagarmeData.charges.length:", pagarmeData.charges?.length || 0);
      if (pagarmeData.charges && pagarmeData.charges.length > 0) {
        const charge = pagarmeData.charges[0];
        console.log("[DEBUG PIX] charge.id:", charge.id);
        console.log("[DEBUG PIX] charge.status:", charge.status);
        console.log("[DEBUG PIX] charge.last_transaction existe:", !!charge.last_transaction);
        if (charge.last_transaction) {
          console.log("[DEBUG PIX] last_transaction.operation_type:", charge.last_transaction.operation_type);
          console.log("[DEBUG PIX] last_transaction.status:", charge.last_transaction.status);
          console.log("[DEBUG PIX] last_transaction.pix existe:", !!charge.last_transaction.pix);
          if (charge.last_transaction.pix) {
            const pixData = charge.last_transaction.pix;
            console.log("[DEBUG PIX] pixData keys:", Object.keys(pixData));
            console.log("[DEBUG PIX] pixData.qr_code existe:", !!pixData.qr_code);
            console.log("[DEBUG PIX] pixData.qr_code_url existe:", !!pixData.qr_code_url);
            console.log("[DEBUG PIX] pixData.expires_at:", pixData.expires_at);
            // Extrair dados do PIX com verificação mais rigorosa
            if (pixData.qr_code) {
              pixResponse.qr_code = pixData.qr_code;
              console.log("[SUCCESS PIX] QR Code extraído:", pixData.qr_code.substring(0, 50) + "...");
            }
            if (pixData.qr_code_url) {
              pixResponse.qr_code_url = pixData.qr_code_url;
              console.log("[SUCCESS PIX] QR Code URL extraída:", pixData.qr_code_url);
            }
            if (pixData.expires_at) {
              pixResponse.expires_at = pixData.expires_at;
              console.log("[SUCCESS PIX] Expires at extraído:", pixData.expires_at);
            }
          } else if (charge.last_transaction.qr_code && charge.last_transaction.qr_code_url) {
            // NOVO: extrair diretamente de last_transaction
            pixResponse.qr_code = charge.last_transaction.qr_code;
            pixResponse.qr_code_url = charge.last_transaction.qr_code_url;
            if (charge.last_transaction.expires_at) pixResponse.expires_at = charge.last_transaction.expires_at;
            console.log("[SUCCESS PIX] QR Code extraído diretamente de last_transaction!");
          } else {
            console.error("[ERROR PIX] last_transaction existe mas pix está ausente e não há qr_code direto");
            console.error("[ERROR PIX] last_transaction:", JSON.stringify(charge.last_transaction, null, 2));
          }
        } else {
          console.error("[ERROR PIX] Charge encontrado mas sem last_transaction:");
          console.error("[ERROR PIX] Charge:", JSON.stringify(charge, null, 2));
        }
      } else {
        console.error("[ERROR PIX] Nenhum charge encontrado na resposta:");
        console.error("[ERROR PIX] Resposta completa:", JSON.stringify(pagarmeData, null, 2));
      }
      console.log("[DEBUG PIX] ============================================");
      // VALIDAR SE O QR CODE FOI GERADO - COM VERIFICAÇÃO MAIS ESPECÍFICA
      const hasQrCode = pixResponse.qr_code && pixResponse.qr_code.length > 0;
      const hasQrCodeUrl = pixResponse.qr_code_url && pixResponse.qr_code_url.length > 0;
      console.log("[DEBUG PIX] Status QR Code após extração inicial:", {
        hasQrCode,
        hasQrCodeUrl,
        qrCodeLength: pixResponse.qr_code?.length || 0,
        qrCodeUrlLength: pixResponse.qr_code_url?.length || 0
      });
      if (!hasQrCode || !hasQrCodeUrl) {
        console.log("[INFO PIX] QR Code não disponível imediatamente, aplicando delay de produção...");
        // DELAY OTIMIZADO PARA PRODUÇÃO (QR Code gerado em ~60s)
        const delayTime = isTestMode ? 3000 : 45000; // 45 segundos para produção, 3s para sandbox
        console.log(`[INFO PIX] Aguardando ${delayTime / 1000} segundos para ${isTestMode ? 'sandbox' : 'produção'}...`);
        if (!isTestMode) {
          console.log("[🔴 PRODUÇÃO] Iniciando delay de 45 SEGUNDOS para processamento PIX...");
          console.log("[🔴 PRODUÇÃO] Tempo: 45 segundos (QR Code gerado em ~60s no Pagar.me)");
        }
        await new Promise((resolve)=>setTimeout(resolve, delayTime));
        try {
          console.log("[DEBUG PIX] Consultando pedido via GET:", pagarmeData.id);
          const orderResponse = await fetch(`https://api.pagar.me/core/v5/orders/${pagarmeData.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': basicAuth
            }
          });
          if (!orderResponse.ok) {
            console.error("[ERROR PIX] Erro na consulta GET do pedido:", orderResponse.status);
            const errorText = await orderResponse.text();
            console.error("[ERROR PIX] Resposta de erro GET:", errorText);
          } else {
            const orderData = await orderResponse.json();
            console.log("[DEBUG PIX] ===== RESPOSTA GET ORDER =====");
            console.log("[DEBUG PIX] GET Order Data:", JSON.stringify(orderData, null, 2));
            console.log("[DEBUG PIX] ===================================");
            // ANÁLISE MAIS DETALHADA DA CONSULTA
            if (orderData.charges && orderData.charges.length > 0) {
              const charge = orderData.charges[0];
              console.log("[DEBUG PIX] GET - Charge status:", charge.status);
              console.log("[DEBUG PIX] GET - Last transaction existe:", !!charge.last_transaction);
              if (charge.last_transaction) {
                console.log("[DEBUG PIX] GET - Transaction type:", charge.last_transaction.operation_type);
                console.log("[DEBUG PIX] GET - Transaction status:", charge.last_transaction.status);
                console.log("[DEBUG PIX] GET - PIX data existe:", !!charge.last_transaction.pix);
                if (charge.last_transaction.pix) {
                  const pixData = charge.last_transaction.pix;
                  console.log("[DEBUG PIX] GET - PIX keys:", Object.keys(pixData));
                  // Tentar extrair o QR Code da consulta com verificação rigorosa
                  if (pixData.qr_code && pixData.qr_code.length > 0) {
                    pixResponse.qr_code = pixData.qr_code;
                    console.log("[SUCCESS PIX] QR Code obtido via GET:", pixData.qr_code.substring(0, 50) + "...");
                  }
                  if (pixData.qr_code_url && pixData.qr_code_url.length > 0) {
                    pixResponse.qr_code_url = pixData.qr_code_url;
                    console.log("[SUCCESS PIX] QR Code URL obtida via GET:", pixData.qr_code_url);
                  }
                  if (pixData.expires_at) {
                    pixResponse.expires_at = pixData.expires_at;
                    console.log("[SUCCESS PIX] Expires at obtido via GET:", pixData.expires_at);
                  }
                  console.log("[DEBUG PIX] Status final após GET:", {
                    has_qr_code: !!pixResponse.qr_code,
                    has_qr_code_url: !!pixResponse.qr_code_url,
                    qr_code_length: pixResponse.qr_code?.length || 0,
                    qr_code_url_length: pixResponse.qr_code_url?.length || 0,
                    expires_at: pixResponse.expires_at
                  });
                  // Se ainda não temos QR Code, tentar consultar o charge diretamente
                  if (!pixResponse.qr_code && charge.id) {
                    console.log("[INFO PIX] Tentando consultar charge diretamente:", charge.id);
                    try {
                      const chargeResponse = await fetch(`https://api.pagar.me/core/v5/charges/${charge.id}`, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': basicAuth
                        }
                      });
                      if (chargeResponse.ok) {
                        const chargeData = await chargeResponse.json();
                        console.log("[DEBUG PIX] Resposta GET charge:", JSON.stringify(chargeData, null, 2));
                        if (chargeData.last_transaction?.pix?.qr_code) {
                          pixResponse.qr_code = chargeData.last_transaction.pix.qr_code;
                          pixResponse.qr_code_url = chargeData.last_transaction.pix.qr_code_url;
                          pixResponse.expires_at = chargeData.last_transaction.pix.expires_at;
                          console.log("[SUCCESS PIX] QR Code obtido via GET charge!");
                        } else {
                          console.error("[ERROR PIX] Charge consultado mas PIX ainda não disponível após 45s");
                        }
                      } else {
                        console.error("[ERROR PIX] Erro ao consultar charge:", chargeResponse.status);
                      }
                    } catch (chargeErr) {
                      console.error("[ERROR PIX] Erro ao consultar charge:", chargeErr);
                    }
                  }
                } else {
                  console.error("[ERROR PIX] GET - PIX data ainda não disponível");
                }
              } else {
                console.error("[ERROR PIX] GET - Last transaction ainda não disponível");
              }
            } else {
              console.error("[ERROR PIX] GET - Charges ainda não disponíveis");
            }
          }
        } catch (consultaErr) {
          console.error("[ERROR PIX] Erro na consulta do pedido:", consultaErr);
          console.error("[ERROR PIX] Stack trace:", consultaErr.stack);
        }
      }
      // Se ainda não tiver QR Code, retornar erro detalhado mas com informações úteis
      const finalHasQrCode = pixResponse.qr_code && pixResponse.qr_code.length > 0;
      const finalHasQrCodeUrl = pixResponse.qr_code_url && pixResponse.qr_code_url.length > 0;
      if (!finalHasQrCode || !finalHasQrCodeUrl) {
        console.error("[ERROR PIX] QR Code não foi gerado pela Pagar.me mesmo após consulta com delay de produção");
        console.error("[ERROR PIX] pixResponse final:", JSON.stringify(pixResponse, null, 2));
        // Verificações específicas para diagnóstico de PRODUÇÃO
        const diagnostics = {
          environment: isTestMode ? "sandbox" : "PRODUÇÃO",
          order_created: !!pagarmeData.id,
          order_status: pagarmeData.status,
          amount_real: amountInt / 100,
          has_charges: !!(pagarmeData.charges && pagarmeData.charges.length > 0),
          charge_count: pagarmeData.charges?.length || 0,
          first_charge_status: pagarmeData.charges?.[0]?.status || 'none',
          has_last_transaction: !!pagarmeData.charges?.[0]?.last_transaction,
          transaction_type: pagarmeData.charges?.[0]?.last_transaction?.operation_type || 'none',
          has_pix_data: !!pagarmeData.charges?.[0]?.last_transaction?.pix,
          pix_keys_present: pagarmeData.charges?.[0]?.last_transaction?.pix ? Object.keys(pagarmeData.charges[0].last_transaction.pix) : [],
          delays_applied: isTestMode ? "3s sandbox" : "45s produção",
          api_key_type: secret_key.includes('test') ? 'test' : 'live'
        };
        console.error("[ERROR PIX] Diagnósticos:", JSON.stringify(diagnostics, null, 2));
        return new Response(JSON.stringify({
          error: `QR Code PIX não disponível via API em ${isTestMode ? 'sandbox' : 'PRODUÇÃO'} após múltiplas tentativas e delays.`,
          order_id: pagarmeData.id,
          order_status: pagarmeData.status,
          environment: isTestMode ? "sandbox" : "PRODUÇÃO",
          dashboard_url: `https://dashboard.pagar.me/transactions/${pagarmeData.id}`,
          diagnostics: diagnostics,
          debug_info: {
            final_qr_code_available: finalHasQrCode,
            final_qr_code_url_available: finalHasQrCodeUrl,
            timing_delays_applied: isTestMode ? "3s sandbox" : "45s produção",
            get_order_attempted: true,
            get_charge_attempted: true,
            environment_detected: isTestMode ? "sandbox" : "PRODUÇÃO"
          },
          recommendations: isTestMode ? [
            "SANDBOX: Consulte o QR Code no dashboard da Pagar.me",
            "SANDBOX: Verifique se o valor está entre R$ 0,50 e R$ 500",
            "SANDBOX: Confirme se a chave de API test está correta"
          ] : [
            "PRODUÇÃO: QR Code deve estar visível no dashboard Pagar.me",
            "PRODUÇÃO: Verifique se a conta PIX está habilitada e ativa",
            "PRODUÇÃO: Entre em contato com suporte Pagar.me (produção tem SLA)",
            "PRODUÇÃO: Confirme se a chave live tem permissões PIX",
            "PRODUÇÃO: Verifique se há configurações específicas de PIX na conta"
          ],
          urgent_action: !isTestMode ? "PRODUÇÃO: Entre em contato IMEDIATO com suporte Pagar.me" : null,
          raw_response: pagarmeData
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({
        success: true,
        ...pixResponse,
        raw_response: pagarmeData // Para debug, remover em produção
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error("[ERROR PIX] Erro no pagamento PIX:", err);
      return new Response(JSON.stringify({
        error: err.message || String(err)
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  } catch (err) {
    console.error("[ERROR PIX] Erro geral:", err);
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
