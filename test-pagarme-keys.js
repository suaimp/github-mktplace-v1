// Teste simples para verificar se as chaves da Pagar.me estão funcionando

async function testPagarmeKeys() {
  // Estas devem ser suas chaves de TESTE (pk_test_... e sk_test_...)
  const PUBLIC_KEY = 'pk_test_SEU_PUBLIC_KEY_AQUI'; // SUBSTITUA pela sua chave pública de teste
  const SECRET_KEY = 'sk_test_SEU_SECRET_KEY_AQUI'; // SUBSTITUA pela sua chave secreta de teste

  console.log('🔍 Testando chaves da Pagar.me...');
  console.log('Chave pública (primeiros 6 chars):', PUBLIC_KEY.substring(0, 6));
  console.log('Chave secreta (primeiros 6 chars):', SECRET_KEY.substring(0, 6));
  
  // Teste 1: Verificar se as chaves são de teste
  const isPublicTest = PUBLIC_KEY.includes('test');
  const isSecretTest = SECRET_KEY.includes('test');
  
  console.log('✅ Chave pública é de teste:', isPublicTest);
  console.log('✅ Chave secreta é de teste:', isSecretTest);
  
  if (!isPublicTest || !isSecretTest) {
    console.log('❌ ERRO: Use chaves de TESTE para desenvolvimento!');
    console.log('As chaves devem conter "test" no nome: pk_test_... e sk_test_...');
    return;
  }

  // Teste 2: Testar tokenização simples
  console.log('\n🧪 Testando tokenização...');
  
  const publicBasicAuth = "Basic " + btoa(PUBLIC_KEY + ":");
  
  try {
    const tokenRes = await fetch('https://api.pagar.me/core/v5/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': publicBasicAuth
      },
      body: JSON.stringify({
        type: 'card',
        card: {
          number: '4000000000000010', // Cartão de teste Visa
          exp_month: 12,
          exp_year: 2030,
          cvv: '123',
          holder_name: 'Teste da Silva',
          billing_address: {
            line_1: "Rua das Flores, 123",
            zip_code: 1234567,
            city: "São Paulo",
            state: "SP",
            country: "BR"
          }
        }
      })
    });

    const tokenData = await tokenRes.text();
    console.log('Status da tokenização:', tokenRes.status);
    console.log('Resposta da tokenização:', tokenData);
    
    if (tokenRes.ok) {
      const parsedToken = JSON.parse(tokenData);
      console.log('✅ Tokenização bem-sucedida! Token:', parsedToken.id);
      
      // Teste 3: Testar pagamento com o token
      console.log('\n💳 Testando pagamento...');
      
      const secretBasicAuth = "Basic " + btoa(SECRET_KEY + ":");
      
      const paymentRes = await fetch('https://api.pagar.me/core/v5/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': secretBasicAuth
        },
        body: JSON.stringify({
          items: [
            {
              amount: 2000, // R$ 20,00
              description: "Teste Marketplace",
              quantity: 1,
              code: "TEST_001"
            }
          ],
          payments: [
            {
              payment_method: 'credit_card',
              credit_card: {
                installments: 1,
                statement_descriptor: "TESTE",
                card_token: parsedToken.id
              }
            }
          ],
          customer: {
            name: "Teste da Silva",
            email: "teste@exemplo.com",
            document: "11144477735",
            document_type: "cpf",
            type: "individual",
            phones: {
              home_phone: {
                country_code: "55",
                area_code: "11", 
                number: "999999999"
              }
            }
          }
        })
      });

      const paymentData = await paymentRes.text();
      console.log('Status do pagamento:', paymentRes.status);
      console.log('Resposta do pagamento:', paymentData);
      
    } else {
      console.log('❌ Falha na tokenização');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testPagarmeKeys().catch(console.error);
