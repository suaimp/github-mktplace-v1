// Teste específico para verificar se o billing address resolve o erro
require('dotenv').config();

const testTokenization = async () => {
  console.log('🧪 Testando tokenização com billing address...\n');

  try {
    // Dados do cartão de teste
    const cardData = {
      action: 'tokenize',
      card_number: '4000000000000010', // Cartão de teste válido
      card_exp_month: '12',
      card_exp_year: '2030',
      card_cvv: '123',
      card_holder_name: 'TESTE BILLING',
      billing_address: {
        line_1: "Rua de Teste, 123",
        zip_code: "01234567",
        city: "São Paulo",
        state: "SP",
        country: "BR"
      }
    };

    console.log('📤 Dados enviados:', JSON.stringify(cardData, null, 2));

    // URL da Edge Function local (se estiver rodando localmente)
    const url = 'http://localhost:54321/functions/v1/pagarme-payment';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-test'
      },
      body: JSON.stringify(cardData)
    });

    const responseText = await response.text();
    console.log('📥 Status:', response.status);
    console.log('📥 Resposta:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      if (result.card_token) {
        console.log('✅ Tokenização bem-sucedida!');
        console.log('🔑 Token:', result.card_token);
      } else {
        console.log('❌ Token não foi gerado');
      }
    } else {
      console.log('❌ Erro na requisição');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

testTokenization();
