const testMinimalBilling = async () => {
  const url = `https://api.pagar.me/core/v5/tokens?appId=pk_test_M9m1rYE4t4TzQqr3`;
  
  // Teste com billing address MÍNIMO conforme documentação
  const minimalPayload = {
    type: 'card',
    card: {
      number: "4000000000000010",
      exp_month: 12,
      exp_year: 2030,
      cvv: "123",
      holder_name: "João Silva",
      billing_address: {
        line_1: "Rua das Flores, 123",
        zip_code: "01234567",
        city: "São Paulo",
        state: "SP",
        country: "BR"
      }
    }
  };

  console.log('=== TESTE BILLING MÍNIMO ===');
  console.log('Payload:', JSON.stringify(minimalPayload, null, 2));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // SEM Authorization header conforme documentação
      },
      body: JSON.stringify(minimalPayload)
    });

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ Tokenização bem-sucedida:', data.id);
    } else {
      console.log('❌ Erro na tokenização');
      try {
        const errorData = JSON.parse(result);
        console.log('Detalhes do erro:', errorData);
      } catch (e) {
        console.log('Resposta não é JSON válido');
      }
    }
    
  } catch (error) {
    console.error('Erro na requisição:', error.message);
  }
};

// Executar o teste
testMinimalBilling();
