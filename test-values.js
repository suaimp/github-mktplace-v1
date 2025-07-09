// Teste para verificar valores enviados para edge function
const testValues = async () => {
  const url = 'https://uxbeaslwirkepnowydfu.supabase.co/functions/v1/pagarme-payment';
  
  // Token de autenticação do Supabase
  const authToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkN2OStub0JZUGxjOTJXcm0iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3V4YmVhc2x3aXJrZXBub3d5ZGZ1LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmY2Q3Y2JjMC1jNzZhLTRhMzctOGVjNi1kNzdhZmYwYTQ0MTUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyMDI4Njg2LCJpYXQiOjE3NTIwMjUwODYsImVtYWlsIjoiY2xhdWRpdmFuLm1lbmV6ZXNAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImNsYXVkaXZhbi5tZW5lemVzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJzdF9uYW1lIjoiY2xhdWRpdmFuIiwibGFzdF9uYW1lIjoibWVuZXplcyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZmNkN2NiYzAtYzc2YS00YTM3LThlYzYtZDc3YWZmMGE0NDE1In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTIwMjUwODZ9XSwic2Vzc2lvbl9pZCI6Ijc2NjNmYTQxLTI5NjUtNDA5YS04MzJkLTIxNjY1Y2U1OGVjMiIsImlzX2Fub255bW91cyI6ZmFsc2V9.PxgwJvKwP50M9oMm4sDqvK821E_Wa9Ev0ROtG1hMzEY';
  
  // Testando diferentes valores como no frontend
  const testCases = [
    { name: 'Valor em centavos (como frontend)', amount: 8000 }, // R$ 80,00
    { name: 'Valor em reais', amount: 80 }, // R$ 80,00
    { name: 'Valor pequeno', amount: 100 }, // R$ 1,00
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 ${testCase.name}: ${testCase.amount}`);
    
    try {
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
          card_holder_name: 'TESTE VALORES',
          amount: testCase.amount
        })
      });
      
      const result = await response.text();
      console.log('📊 Status:', response.status);
      
      // Parse do JSON e extração do erro específico
      try {
        const jsonResult = JSON.parse(result);
        console.log('💰 Valor enviado:', testCase.amount);
        console.log('📋 Status do pagamento:', jsonResult.status);
        
        if (jsonResult.status === 'failed') {
          const error = jsonResult.charges?.[0]?.last_transaction?.gateway_response?.errors?.[0]?.message;
          console.log('❌ Erro:', error);
        } else if (jsonResult.status === 'paid' || jsonResult.status === 'approved') {
          console.log('✅ SUCESSO! Pagamento aprovado!');
        }
      } catch (e) {
        console.log('❌ Erro no parse JSON');
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error.message);
    }
  }
};

testValues();
