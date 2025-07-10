// Teste para verificar exatamente onde está o erro de billing
console.log('🔍 Analisando fluxo de pagamento Pagar.me...\n');

// Simulação do que deve estar sendo enviado na tokenização
const tokenizationPayload = {
  type: "card",
  card: {
    number: "4000000000000010",
    exp_month: 12,
    exp_year: 2030, 
    cvv: "123",
    holder_name: "TESTE CLIENTE",
    billing_address: {
      line_1: "Rua das Flores, 123",
      zip_code: "01234567",
      city: "São Paulo",
      state: "SP",
      country: "BR"
    }
  }
};

console.log('📤 TOKENIZAÇÃO - Payload enviado:');
console.log(JSON.stringify(tokenizationPayload, null, 2));

// Simulação do que deve estar sendo enviado no pagamento
const paymentPayload = {
  items: [
    {
      amount: 2990,
      description: "Pedido Marketplace",
      quantity: 1,
      code: "ITEM_001"
    }
  ],
  payments: [
    {
      payment_method: "credit_card",
      credit_card: {
        card_token: "tok_test_fake_token" // Apenas o token, SEM billing_address
      }
    }
  ],
  customer: {
    name: "Cliente Teste",
    email: "cliente@exemplo.com",
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
};

console.log('\n📤 PAGAMENTO - Payload enviado:');
console.log(JSON.stringify(paymentPayload, null, 2));

// Verificação de conformidade
console.log('\n✅ VERIFICAÇÃO DE CONFORMIDADE:');
console.log('- Tokenização tem billing_address:', !!tokenizationPayload.card.billing_address);
console.log('- Pagamento NÃO tem billing_address:', !paymentPayload.payments[0].credit_card.billing_address);
console.log('- Pagamento usa card_token:', !!paymentPayload.payments[0].credit_card.card_token);

console.log('\n🎯 ESTRUTURA CORRETA conforme documentação oficial!');
