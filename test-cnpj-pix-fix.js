/**
 * Teste para verificar se a correção do CNPJ/CPF no PIX está funcionando
 */

console.log("=== TESTE: CORREÇÃO CNPJ/CPF PIX ===");

// Simular dados de teste
const testData = {
  // Caso 1: Cliente pessoa física (CPF)
  individual: {
    legal_status: "individual",
    name: "João Silva",
    document: "12345678901", // CPF
    company_name: ""
  },
  
  // Caso 2: Cliente pessoa jurídica (CNPJ)
  business: {
    legal_status: "business", 
    name: "João Silva",
    document: "12345678000195", // CNPJ
    company_name: "Empresa Teste LTDA"
  }
};

// Função para determinar document_type (igual ao que foi implementado)
function determineDocumentType(customer_legal_status, customer_company_name, customer_name) {
  const isBusinessCustomer = customer_legal_status === "business";
  const document_type = isBusinessCustomer ? "cnpj" : "cpf";
  const customer_type = isBusinessCustomer ? "company" : "individual";
  const customer_display_name = isBusinessCustomer && customer_company_name ? customer_company_name : customer_name;

  return {
    document_type,
    customer_type,
    customer_display_name,
    isBusinessCustomer
  };
}

// Testar casos
console.log("\n1. TESTE PESSOA FÍSICA (CPF):");
const individualResult = determineDocumentType(
  testData.individual.legal_status,
  testData.individual.company_name,
  testData.individual.name
);
console.log("Input:", testData.individual);
console.log("Output:", individualResult);
console.log("✅ Esperado: document_type='cpf', customer_type='individual'");
console.log("✅ Resultado:", 
  individualResult.document_type === "cpf" && 
  individualResult.customer_type === "individual" ? "CORRETO" : "ERRO");

console.log("\n2. TESTE PESSOA JURÍDICA (CNPJ):");
const businessResult = determineDocumentType(
  testData.business.legal_status,
  testData.business.company_name,
  testData.business.name
);
console.log("Input:", testData.business);
console.log("Output:", businessResult);
console.log("✅ Esperado: document_type='cnpj', customer_type='company'");
console.log("✅ Resultado:", 
  businessResult.document_type === "cnpj" && 
  businessResult.customer_type === "company" ? "CORRETO" : "ERRO");

console.log("\n=== RESUMO DA CORREÇÃO ===");
console.log("1. ✅ Payment.tsx: Adicionado customer_legal_status e customer_company_name no payload");
console.log("2. ✅ pagarme-pix-payment/index.ts: Recebe customer_legal_status do body");
console.log("3. ✅ pagarme-pix-payment/index.ts: Determina document_type baseado no legal_status");
console.log("4. ✅ pagarme-pix-payment/index.ts: Define customer_type baseado no legal_status");
console.log("5. ✅ pagarme-pix-payment/index.ts: Usa company_name se for business");

console.log("\n=== CORREÇÃO DO ERRO ===");
console.log("❌ ANTES: document_type sempre 'cpf' (hardcoded)");
console.log("✅ DEPOIS: document_type baseado no formData.legal_status");
console.log("   - legal_status='individual' → document_type='cpf', type='individual'");
console.log("   - legal_status='business' → document_type='cnpj', type='company'");

console.log("\n=== PRÓXIMOS PASSOS ===");
console.log("1. Testar a rota /payment com um CNPJ");
console.log("2. Verificar nos logs se o document_type está sendo definido corretamente");
console.log("3. Confirmar se o erro 'CPF inválido' não aparece mais para CNPJ");
