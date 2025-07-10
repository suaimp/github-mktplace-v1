// Teste direto com a API do Pagar.me para verificar billing address
require('dotenv').config();

const testPagarmeDirectly = async () => {
  console.log('🧪 Testando tokenização diretamente com API Pagar.me...\n');

  // IMPORTANTE: Você precisa substituir por sua chave pública de teste
  // Exemplo: pk_test_xxxxxxxxxxxx
  const PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxx'; // SUBSTITUA PELA SUA CHAVE
  
  if (PUBLIC_KEY === 'pk_test_xxxxxxxxxxxxx') {
    console.log('❌ Por favor, substitua a PUBLIC_KEY pela sua chave pública de teste do Pagar.me');
    console.log('📝 Você pode encontrar ela no dashboard do Pagar.me > API Keys > Chave Pública');
    return;
  }

  try {
    // Teste 1: SEM billing address (para reproduzir o erro)
    console.log('🔸 Teste 1: Tokenização SEM billing address');
    const cardDataWithoutBilling = {
      type: 'card',
      card: {
        number: '4000000000000010',
        exp_month: 12,
        exp_year: 2030,
        cvv: '123',
        holder_name: 'TESTE SEM BILLING'
      }
    };

    console.log('📤 Dados enviados (sem billing):', JSON.stringify(cardDataWithoutBilling, null, 2));
    
    const responseWithoutBilling = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${PUBLIC_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardDataWithoutBilling)
    });

    const resultWithoutBilling = await responseWithoutBilling.text();
    console.log('📥 Status (sem billing):', responseWithoutBilling.status);
    console.log('📥 Resposta (sem billing):', resultWithoutBilling);
    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: COM billing address (para testar a correção)
    console.log('🔸 Teste 2: Tokenização COM billing address');
    const cardDataWithBilling = {
      type: 'card',
      card: {
        number: '4000000000000010',
        exp_month: 12,
        exp_year: 2030,
        cvv: '123',
        holder_name: 'TESTE COM BILLING',
        billing_address: {
          line_1: "Rua de Teste, 123",
          zip_code: "01234567",
          city: "São Paulo",
          state: "SP",
          country: "BR"
        }
      }
    };

    console.log('📤 Dados enviados (com billing):', JSON.stringify(cardDataWithBilling, null, 2));
    
    const responseWithBilling = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${PUBLIC_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardDataWithBilling)
    });

    const resultWithBilling = await responseWithBilling.text();
    console.log('📥 Status (com billing):', responseWithBilling.status);
    console.log('📥 Resposta (com billing):', resultWithBilling);

    // Análise dos resultados
    console.log('\n' + '='.repeat(50));
    console.log('📊 ANÁLISE DOS RESULTADOS:');
    
    if (responseWithoutBilling.status === 400 && resultWithoutBilling.includes('billing')) {
      console.log('✅ Confirmado: Erro de billing quando não enviado');
    }
    
    if (responseWithBilling.status === 200 || responseWithBilling.status === 201) {
      console.log('✅ Confirmado: Tokenização bem-sucedida COM billing address');
      try {
        const parsed = JSON.parse(resultWithBilling);
        if (parsed.id) {
          console.log('🔑 Token gerado:', parsed.id);
        }
      } catch (e) {
        console.log('❌ Erro ao parsear resposta');
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
};

testPagarmeDirectly();
