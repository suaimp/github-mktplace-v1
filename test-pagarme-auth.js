// Teste para verificar as chaves da Pagar.me e fazer uma requisição de teste
const testPagarmeAuth = async () => {
  console.log("=== TESTE DE CHAVES PAGAR.ME ===");
  
  // IMPORTANTE: Substitua pela sua chave pública real
  const PUBLIC_KEY = 'pk_live_SUA_CHAVE_PUBLICA_AQUI'; // ← SUBSTITUA AQUI
  
  if (PUBLIC_KEY === 'pk_live_SUA_CHAVE_PUBLICA_AQUI') {
    console.log("❌ ERRO: Você precisa substituir PUBLIC_KEY pela sua chave pública real!");
    console.log("Edite este arquivo e coloque sua chave pública da Pagar.me");
    return;
  }

  const tokenUrl = 'https://api.pagar.me/core/v5/tokens';
  const publicBasicAuth = "Basic " + btoa(PUBLIC_KEY + ":");
  
  const tokenData = {
    type: 'card',
    card: {
      number: '4111111111111111', // Cartão de teste Visa
      exp_month: 12,
      exp_year: 2025,
      cvv: '123',
      holder_name: 'TESTE USUARIO',
      billing_address: {
        line_1: "Rua das Flores, 123",
        zip_code: 1234567,
        city: "São Paulo",
        state: "SP",
        country: "BR"
      }
    }
  };

  try {
    console.log("URL:", tokenUrl);
    console.log("Chave pública:", PUBLIC_KEY.substring(0, 10) + "...");
    console.log("Auth header:", publicBasicAuth.substring(0, 20) + "...");
    console.log("Payload:", JSON.stringify(tokenData, null, 2));
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': publicBasicAuth
      },
      body: JSON.stringify(tokenData)
    });

    const result = await response.text();
    console.log("\n=== RESULTADO ===");
    console.log("Status:", response.status);
    console.log("Resposta:", result);

    if (response.status === 401) {
      console.log("\n❌ ERRO 401: Possíveis causas:");
      console.log("1. Chave pública incorreta ou inválida");
      console.log("2. Chave pública expirada ou revogada");
      console.log("3. Conta Pagar.me com restrições");
      console.log("4. Ambiente de produção com regras específicas");
      console.log("5. Domínio/IP não autorizado");
      
      console.log("\n🔍 Verifique:");
      console.log("1. Se a chave pública está correta no painel da Pagar.me");
      console.log("2. Se a conta está ativa e sem pendências");
      console.log("3. Se há restrições de domínio configuradas");
    } else if (response.status === 200) {
      console.log("\n✅ SUCESSO: Tokenização funcionou!");
      console.log("O problema pode estar na Edge Function do Supabase");
    }

  } catch (error) {
    console.error("Erro na requisição:", error);
  }
};

// Executar o teste
testPagarmeAuth();
