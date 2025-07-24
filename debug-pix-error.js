/**
 * Teste de debug para identificar o erro atual no PIX
 * baseado nos logs da imagem fornecida
 */

import { validateDocument } from '../src/pages/Checkout/Payment/pix/utils/documentValidation';

console.log('=== TESTE DE DEBUG PIX - ERRO ATUAL ===\n');

// Simular dados que estão causando o erro baseado nos logs
const testScenarios = [
  {
    name: 'CENÁRIO 1: Pessoa Física (CPF)',
    data: {
      document: '12345678901',
      legal_status: 'individual' as const,
      company_name: '',
      customer_name: 'João Silva'
    }
  },
  {
    name: 'CENÁRIO 2: Pessoa Jurídica (CNPJ)',
    data: {
      document: '12345678000195',
      legal_status: 'business' as const,
      company_name: 'Empresa Teste LTDA',
      customer_name: 'João Silva'
    }
  },
  {
    name: 'CENÁRIO 3: CNPJ com documento inválido (13 dígitos)',
    data: {
      document: '1234567800019',
      legal_status: 'business' as const,
      company_name: 'Empresa Teste LTDA',
      customer_name: 'João Silva'
    }
  },
  {
    name: 'CENÁRIO 4: CPF com documento inválido (10 dígitos)',
    data: {
      document: '1234567890',
      legal_status: 'individual' as const,
      company_name: '',
      customer_name: 'João Silva'
    }
  }
];

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log('   Input:', scenario.data);
  
  const validation = validateDocument(
    scenario.data.document,
    scenario.data.legal_status,
    scenario.data.company_name,
    scenario.data.customer_name
  );
  
  console.log('   Resultado:', {
    isValid: validation.isValid,
    documentType: validation.documentType,
    customerType: validation.customerType,
    displayName: validation.displayName,
    expectedLength: validation.expectedLength,
    actualLength: scenario.data.document.replace(/\D/g, '').length,
    typeName: validation.typeName
  });
  
  if (!validation.isValid) {
    console.log('   ❌ ERRO:', `${validation.typeName} inválido - esperado ${validation.expectedLength} dígitos, recebido ${scenario.data.document.replace(/\D/g, '').length}`);
  } else {
    console.log('   ✅ VÁLIDO');
  }
  console.log('');
});

console.log('=== ANÁLISE DO ERRO ===');
console.log('Baseado nos logs da imagem, o erro pode estar ocorrendo porque:');
console.log('1. O frontend não está enviando o legal_status corretamente');
console.log('2. O backend não está recebendo o customer_legal_status');
console.log('3. A validação está usando valores undefined/null');
console.log('4. Há um problema na lógica de determinação do document_type');

console.log('\n=== PRÓXIMOS PASSOS DE DEBUG ===');
console.log('1. Verificar se formData.legal_status está sendo definido corretamente');
console.log('2. Verificar se o payload está sendo enviado com customer_legal_status');
console.log('3. Verificar se a edge function está recebendo customer_legal_status');
console.log('4. Verificar se a validação do documento está usando os valores corretos');
console.log('5. Adicionar logs detalhados em cada etapa do processo');
