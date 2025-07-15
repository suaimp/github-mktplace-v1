// Teste simples do Pagar.me para diagnosticar o problema
console.log('🧪 Teste do Pagar.me - Cartão de Teste');

const SUPABASE_URL = 'https://uxbeaslwirkepnowydfu.supabase.co';

// Simular dados de um usuário logado (você precisa pegar um token real)
const AUTH_TOKEN = 'SEU_TOKEN_AQUI'; // Substitua por um token real

async function testarTokenizacao() {
  console.log('1️⃣ Testando tokenização...');
  
  const tokenResponse = await fetch(`${SUPABASE_URL}/functions/v1/pagarme-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'tokenize',
      card_number: '4111111111111111',
      card_exp_month: '12',
      card_exp_year: '2030',
      card_cvv: '123',
      card_holder_name: 'TESTE SILVA',
      billing_address: {
        line_1: 'Rua Teste, 123',
        zip_code: '01234567',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR'
      }
    })
  });

  const tokenResult = await tokenResponse.json();
  console.log('📋 Resultado da tokenização:', tokenResult);
  
  if (tokenResult.card_token) {
    console.log('✅ Token criado:', tokenResult.card_token);
    return tokenResult.card_token;
  } else {
    console.log('❌ Erro na tokenização:', tokenResult.error);
    return null;
  }
}

async function testarPagamento(cardToken) {
  if (!cardToken) {
    console.log('❌ Não é possível testar pagamento sem token');
    return;
  }

  console.log('2️⃣ Testando pagamento...');
  
  const paymentResponse = await fetch(`${SUPABASE_URL}/functions/v1/pagarme-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'payment_with_token',
      amount: 1500, // R$ 15,00 em centavos
      card_token: cardToken,
      customer_name: 'Teste Silva',
      customer_email: 'teste@exemplo.com',
      customer_document: '11144477735',
      billing_address: {
        line_1: 'Rua Teste, 123',
        zip_code: '01234567',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR'
      }
    })
  });

  const paymentResult = await paymentResponse.json();
  console.log('💳 Resultado do pagamento:', paymentResult);
}

async function executarTeste() {
  console.log('🚀 Iniciando teste do Pagar.me...');
  
  // Primeiro testar se as chaves estão configuradas
  const checkKeysResponse = await fetch(`${SUPABASE_URL}/functions/v1/pagarme-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'check_keys'
    })
  });

  const keysResult = await checkKeysResponse.json();
  console.log('🔑 Status das chaves:', keysResult);

  if (keysResult.keys_configured) {
    const token = await testarTokenizacao();
    await testarPagamento(token);
  } else {
    console.log('❌ Chaves não configuradas corretamente');
  }
}

// Para usar este teste:
// 1. Substitua AUTH_TOKEN por um token real
// 2. Execute: node test-pagarme-simple.js
console.log('⚠️ IMPORTANTE: Substitua AUTH_TOKEN por um token real antes de executar');
