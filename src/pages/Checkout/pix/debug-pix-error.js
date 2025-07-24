/**
 * Debug específico para identificar o erro no PIX
 * Baseado nos logs da Edge Function
 */

// Função para validar documento PIX
function validatePixDocument(document, legalStatus) {
  const documentClean = document.replace(/\D/g, '');
  const isBusinessCustomer = legalStatus === 'business';
  const documentType = isBusinessCustomer ? 'cnpj' : 'cpf';
  const expectedLength = isBusinessCustomer ? 14 : 11;
  const customerType = isBusinessCustomer ? 'company' : 'individual';

  if (!documentClean || documentClean.length !== expectedLength) {
    return {
      isValid: false,
      documentType,
      expectedLength,
      customerType,
      error: `${documentType.toUpperCase()} deve ter ${expectedLength} dígitos. Recebido: ${documentClean.length} dígitos`
    };
  }

  return {
    isValid: true,
    documentType,
    expectedLength,
    customerType
  };
}

// Função para gerar debug info
function generatePixDebugInfo(legalStatus, document) {
  const documentClean = document.replace(/\D/g, '');
  const validation = validatePixDocument(document, legalStatus);
  
  return {
    customer_legal_status: legalStatus,
    customer_legal_status_type: typeof legalStatus,
    customer_document: document,
    customer_document_clean: documentClean,
    customer_document_length: documentClean.length,
    expected_document_type: validation.documentType,
    expected_customer_type: validation.customerType,
    timestamp: new Date().toISOString()
  };
}

// Dados do teste baseados nos logs da edge function
const testData = {
  amount: 2880, // Como mostrado nos logs
  customer_name: "claudivan menezes",
  customer_email: "claudivan.menezes@gmail.com", 
  customer_document: "37982508000142", // CNPJ de 14 dígitos
  customer_phone: "55110826343445",
  customer_legal_status: "business", // Deve ser business para CNPJ
  customer_company_name: "Empresa Teste LTDA",
  order_id: "aaa5e222-df98-4fb2-a3c4-e356e12341bf"
};

console.log("=== DEBUG PIX ERROR - Análise dos logs ===");
console.log("📋 Dados do teste (baseado nos logs):", testData);

// Testar validação do documento
console.log("\n🔍 VALIDAÇÃO DO DOCUMENTO:");
const validation = validatePixDocument(testData.customer_document, testData.customer_legal_status);
console.log("- Documento:", testData.customer_document);
console.log("- Legal Status:", testData.customer_legal_status);
console.log("- Validação:", validation);

// Gerar debug info
console.log("\n🐛 DEBUG INFO:");
const debugInfo = generatePixDebugInfo(testData.customer_legal_status, testData.customer_document);
console.log(debugInfo);

// Verificar o que pode estar causando o erro 400
console.log("\n❓ POSSÍVEIS CAUSAS DO ERRO 400:");

// 1. Verificar se legal_status está sendo enviado corretamente
if (!testData.customer_legal_status) {
  console.log("❌ ERRO: legal_status não definido");
} else {
  console.log("✅ legal_status definido:", testData.customer_legal_status);
}

// 2. Verificar se o documento tem a quantidade correta de dígitos
const docClean = testData.customer_document.replace(/\D/g, '');
if (testData.customer_legal_status === 'business' && docClean.length !== 14) {
  console.log("❌ ERRO: CNPJ deve ter 14 dígitos, tem:", docClean.length);
} else if (testData.customer_legal_status === 'individual' && docClean.length !== 11) {
  console.log("❌ ERRO: CPF deve ter 11 dígitos, tem:", docClean.length);
} else {
  console.log("✅ Documento com quantidade correta de dígitos");
}

// 3. Verificar campos obrigatórios
const requiredFields = ['amount', 'customer_name', 'customer_email', 'customer_document'];
const missingFields = requiredFields.filter(field => !testData[field]);

if (missingFields.length > 0) {
  console.log("❌ CAMPOS OBRIGATÓRIOS AUSENTES:", missingFields);
} else {
  console.log("✅ Todos os campos obrigatórios presentes");
}

// 4. Verificar valor
if (testData.amount < 50) { // Mínimo R$ 0,50 = 50 centavos
  console.log("❌ ERRO: Valor muito baixo, mínimo R$ 0,50");
} else {
  console.log("✅ Valor válido:", `R$ ${(testData.amount / 100).toFixed(2)}`);
}

console.log("\n=== DIAGNÓSTICO BASEADO NOS LOGS ===");
console.log("Pelos logs da Edge Function, vemos:");
console.log("- Ambiente: PRODUÇÃO (chave live)");
console.log("- Valor original: 2880 (R$ 28,80)");
console.log("- Documento: 37982508000142 (14 dígitos = CNPJ)");
console.log("- Legal status: deve ser 'business' para CNPJ");

console.log("\n=== POSSÍVEL CAUSA DO ERRO ===");
console.log("O erro 400 pode estar ocorrendo porque:");
console.log("1. A Edge Function não está recebendo customer_legal_status");
console.log("2. A validação ainda está hardcoded para CPF");
console.log("3. O Pagar.me está rejeitando o CNPJ como CPF");

console.log("\n=== PRÓXIMOS PASSOS ===");
console.log("1. Verificar se customer_legal_status está no payload enviado");
console.log("2. Verificar logs completos da Edge Function");
console.log("3. Verificar se a correção foi aplicada na Edge Function");
console.log("4. Testar com CPF para ver se funciona");

// Simular o payload que seria enviado para a Edge Function
const edgeFunctionPayload = {
  ...testData,
  order_items: [
    {
      amount: testData.amount,
      description: "www.teste.com",
      quantity: 1,
      code: "87bec548-3270-447e-a0c8-beef2916c80a"
    }
  ]
};

console.log("\n📤 PAYLOAD PARA EDGE FUNCTION:");
console.log(JSON.stringify(edgeFunctionPayload, null, 2));
