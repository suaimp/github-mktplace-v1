// Teste de pagamento direto com token válido
// Para obter um token válido:
// 1. Faça login na aplicação
// 2. Abra o DevTools (F12)
// 3. Vá para Application > Local Storage
// 4. Procure por 'supabase.auth.token' ou similar
// 5. Copie o access_token e cole aqui

const testWithValidToken = async () => {
  console.log('⚠️  INSTRUÇÕES:');
  console.log('1. Faça login na aplicação web');
  console.log('2. Abra DevTools (F12) > Application > Local Storage');
  console.log('3. Procure o token do Supabase');
  console.log('4. Atualize a variável authToken abaixo');
  console.log('5. Execute novamente: node test-with-valid-token.js\n');
  
  // COLE SEU TOKEN VÁLIDO AQUI (obtido do DevTools após login)
  const authToken = 'SEU_TOKEN_AQUI';
  
  if (authToken === 'SEU_TOKEN_AQUI') {
    console.log('❌ Por favor, atualize o authToken com um token válido.');
    return;
  }
  
  const url = 'https://uxbeaslwirkepnowydfu.supabase.co/functions/v1/pagarme-payment';
  
  try {
    console.log('💳 Testando pagamento com token válido...\n');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'direct_payment',
        card_number: '4000000000000002', // Cartão aprovado
        card_exp_month: '12',
        card_exp_year: '2030',
        card_cvv: '123',
        card_holder_name: 'TESTE PAGAMENTO',
        amount: 5000, // R$ 50,00 em centavos
        customer_name: 'João Silva',
        customer_email: 'joao@exemplo.com',
        customer_document: '11144477735',
        billing_address: {
          line_1: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100',
          country: 'BR'
        }
      })
    });
    
    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Resultado:\n', result);
    
    try {
      const json = JSON.parse(result);
      if (json.status === 'paid' || json.status === 'approved') {
        console.log('\n✅ SUCESSO! Pagamento aprovado!');
      } else if (json.status === 'failed') {
        console.log('\n❌ Pagamento falhou');
        if (json.charges?.[0]?.last_transaction?.gateway_response?.errors) {
          console.log('Erros:', json.charges[0].last_transaction.gateway_response.errors);
        }
      }
    } catch (e) {
      console.log('Erro no parse JSON:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

testWithValidToken();
