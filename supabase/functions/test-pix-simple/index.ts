const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Obter a secret key
    const secret_key = Deno.env.get('PAGARME');
    if (!secret_key) {
      return new Response(JSON.stringify({
        error: 'PAGARME secret não configurado'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const basicAuth = "Basic " + btoa(secret_key + ":");
    console.log("Testando PIX com payload mínimo...");
    // PAYLOAD MÍNIMO PARA TESTAR PIX
    const testPayload = {
      items: [
        {
          amount: 100,
          description: "Teste PIX",
          quantity: 1,
          code: "TEST_PIX"
        }
      ],
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: 3600
          }
        }
      ],
      customer: {
        name: "Teste PIX",
        email: "teste@exemplo.com",
        document: "12345678900",
        document_type: "cpf",
        type: "individual"
      }
    };
    console.log("Payload de teste:", JSON.stringify(testPayload, null, 2));
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth
      },
      body: JSON.stringify(testPayload)
    });
    const responseText = await response.text();
    console.log("Status:", response.status);
    console.log("Resposta:", responseText);
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = {
        raw: responseText
      };
    }
    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      response: responseData,
      pix_available: responseData?.charges?.[0]?.last_transaction?.pix ? true : false,
      raw: responseText
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Erro no teste PIX:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
