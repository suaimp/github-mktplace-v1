// Teste de pagamento direto (sem tokenização)
// Execute com: node test-direct-payment.js

const testDirectPayment = async () => {
  const url = 'https://uxbeaslwirkepnowydfu.supabase.co/functions/v1/pagarme-payment';
  
  // Token de autenticação do Supabase
  const authToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkN2OStub0JZUGxjOTJXcm0iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3V4YmVhc2x3aXJrZXBub3d5ZGZ1LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmY2Q3Y2JjMC1jNzZhLTRhMzctOGVjNi1kNzdhZmYwYTQ0MTUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyMDI4Njg2LCJpYXQiOjE3NTIwMjUwODYsImVtYWlsIjoiY2xhdWRpdmFuLm1lbmV6ZXNAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImNsYXVkaXZhbi5tZW5lemVzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJzdF9uYW1lIjoiY2xhdWRpdmFuIiwibGFzdF9uYW1lIjoibWVuZXplcyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiZmNkN2NiYzAtYzc2YS00YTM3LThlYzYtZDc3YWZmMGE0NDE1In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTIwMjUwODZ9XSwic2Vzc2lvbl9pZCI6Ijc2NjNmYTQxLTI5NjUtNDA5YS04MzJkLTIxNjY1Y2U1OGVjMiIsImlzX2Fub255bW91cyI6ZmFsc2V9.PxgwJvKwP50M9oMm4sDqvK821E_Wa9Ev0ROtG1hMzEY';
  
  try {
    console.log('💳 Testando pagamento direto (sem tokenização)...\n');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        action: 'direct_payment',
        card_number: '4000000000000044', // Cartão de teste que será aprovado
        card_exp_month: '12',
        card_exp_year: '2030',
        card_cvv: '123',
        card_holder_name: 'TESTE PAGAMENTO DIRETO',
        amount: 5000 // R$ 50,00 em centavos (valor maior para teste)
      })
    });
    
    const result = await response.text();
    console.log('📊 Status da resposta:', response.status);
    console.log('📄 Resultado:\n', result);
    
    // Tentar fazer parse do JSON
    try {
      const jsonResult = JSON.parse(result);
      console.log('\n📋 Resumo:');
      
      if (response.status === 200 || response.status === 201) {
        console.log('✅ Pagamento realizado com sucesso!');
        console.log('🆔 ID da transação:', jsonResult.id);
        console.log('💰 Status:', jsonResult.status);
        console.log('💸 Valor:', jsonResult.amount ? `R$ ${(jsonResult.amount / 100).toFixed(2)}` : 'N/A');
      } else {
        console.log('❌ Pagamento falhou');
        console.log('🔍 Erro:', jsonResult.message || jsonResult.error);
        
        if (jsonResult.errors) {
          console.log('📝 Detalhes dos erros:');
          console.log(JSON.stringify(jsonResult.errors, null, 2));
        }
      }
    } catch (e) {
      console.log('⚠️ Resposta não é JSON válido');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
};

// Executar o teste
testDirectPayment();
