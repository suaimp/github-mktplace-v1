// Teste para investigar o erro específico de "billing value required"
console.log('🔍 Investigando erro: validation_error | billing | "value" is required\n');

// Possíveis causas do erro:
console.log('📋 POSSÍVEIS CAUSAS:');
console.log('1. Campo billing_address malformado na tokenização');
console.log('2. Campo obrigatório missing no credit_card object');
console.log('3. Validação específica da Pagar.me falhou');
console.log('4. Problema com o valor (amount) na requisição\n');

// Testando estrutura completa conforme documentação
const tokenPayload = {
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

const paymentPayload = {
  items: [
    {
      amount: 2990, // Valor em centavos
      description: "Pedido Marketplace",
      quantity: 1,
      code: "ITEM_001"
    }
  ],
  payments: [
    {
      payment_method: "credit_card",
      credit_card: {
        recurrence_cycle: "first",
        installments: 1,
        statement_descriptor: "MARKETPLACE",
        card_token: "tok_test_fake_token"
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

console.log('✅ VALIDAÇÕES:');
console.log('- Tokenização tem billing_address completo:', !!tokenPayload.card.billing_address);
console.log('- Pagamento tem recurrence_cycle:', !!paymentPayload.payments[0].credit_card.recurrence_cycle);
console.log('- Pagamento tem installments:', !!paymentPayload.payments[0].credit_card.installments);
console.log('- Pagamento tem statement_descriptor:', !!paymentPayload.payments[0].credit_card.statement_descriptor);
console.log('- Customer tem document:', !!paymentPayload.customer.document);
console.log('- Amount é number:', typeof paymentPayload.items[0].amount === 'number');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Teste na aplicação e verifique em qual etapa falha');
console.log('2. Se falha na tokenização: problema no billing_address');
console.log('3. Se falha no pagamento: problema nos campos obrigatórios do credit_card');
console.log('4. Verifique os logs completos no console do navegador');
