// CPFs válidos para teste
export const VALID_TEST_CPFS = [
  '11144477735', // CPF válido para testes
  '12345678909', // CPF válido para testes Pagar.me
  '00000000191'  // CPF válido para testes
];

export const TEST_CUSTOMER_DATA = {
  name: 'João da Silva Teste',
  email: 'teste.pix@exemplo.com',
  document: VALID_TEST_CPFS[0], // Usando CPF válido
  document_type: 'cpf',
  phone: {
    country_code: '55',
    area_code: '11',
    number: '999999999'
  },
  address: {
    line_1: 'Rua dos Testes, 123',
    line_2: 'Apt 456',
    zip_code: '01310-100',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR'
  }
};

console.log('📋 CPFs válidos para teste disponíveis:');
VALID_TEST_CPFS.forEach((cpf, index) => {
  console.log(`${index + 1}. ${cpf}`);
});

console.log('\n🎯 Use estes CPFs no seu frontend para testar PIX localmente');
console.log('💡 O erro "Resposta inválida do servidor PIX" era causado pelo CPF inválido');
