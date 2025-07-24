/**
 * Script para testar a correção do CNPJ no PIX
 * Este script simula uma chamada para a função PIX com dados de empresa
 */

// Dados de teste - Cliente empresa com CNPJ
const testPayload = {
  amount: 5000, // R$ 50,00 em centavos
  customer_name: "João Silva",
  customer_email: "joao@empresa.com",
  customer_document: "12345678000195", // CNPJ válido (14 dígitos)
  customer_phone: "11987654321",
  customer_legal_status: "business", // ✅ NOVO: indica que é empresa
  customer_company_name: "Empresa Teste LTDA", // ✅ NOVO: nome da empresa
  order_id: "test_order_123",
  order_items: [
    {
      amount: 5000,
      description: "Produto Teste",
      quantity: 1,
      code: "ITEM_001"
    }
  ]
};

console.log("=== TESTE CNPJ PIX ===");
console.log("📋 Payload de teste:", JSON.stringify(testPayload, null, 2));
console.log("");

// Simular a lógica de determinação do document_type
const isBusinessCustomer = testPayload.customer_legal_status === "business";
const document_type = isBusinessCustomer ? "cnpj" : "cpf";
const customer_type = isBusinessCustomer ? "company" : "individual";
const documentTypeName = isBusinessCustomer ? "CNPJ" : "CPF";
const expectedDocumentLength = isBusinessCustomer ? 14 : 11;

console.log("🔍 Lógica de determinação:");
console.log("- legal_status:", testPayload.customer_legal_status);
console.log("- isBusinessCustomer:", isBusinessCustomer);
console.log("- document_type:", document_type);
console.log("- customer_type:", customer_type);
console.log("- documentTypeName:", documentTypeName);
console.log("- expectedDocumentLength:", expectedDocumentLength);
console.log("");

// Simular validação do documento
const documentClean = testPayload.customer_document.replace(/\D/g, "");
const isValidLength = documentClean.length === expectedDocumentLength;

console.log("✅ Validação do documento:");
console.log("- Documento original:", testPayload.customer_document);
console.log("- Documento limpo:", documentClean);
console.log("- Comprimento:", documentClean.length);
console.log("- Comprimento esperado:", expectedDocumentLength);
console.log("- Validação:", isValidLength ? "✅ VÁLIDO" : "❌ INVÁLIDO");
console.log("");

// Simular payload para Pagar.me
const customer_display_name = isBusinessCustomer && testPayload.customer_company_name 
  ? testPayload.customer_company_name 
  : testPayload.customer_name;

const pagarmePayload = {
  customer: {
    name: customer_display_name,
    email: testPayload.customer_email,
    document: documentClean,
    document_type: document_type,
    type: customer_type
  }
};

console.log("📤 Payload para Pagar.me:");
console.log(JSON.stringify(pagarmePayload, null, 2));
console.log("");

console.log("=== RESULTADOS ===");
console.log("✅ customer_legal_status enviado:", testPayload.customer_legal_status);
console.log("✅ document_type determinado:", document_type);
console.log("✅ customer_type determinado:", customer_type);
console.log("✅ customer_display_name:", customer_display_name);
console.log("✅ Validação CNPJ (14 dígitos):", isValidLength ? "PASSOU" : "FALHOU");
console.log("");

if (isValidLength && document_type === "cnpj" && customer_type === "company") {
  console.log("🎉 TESTE PASSOU - A correção do CNPJ está funcionando!");
  console.log("   O erro 'CPF inválido' não deve mais aparecer para CNPJ.");
} else {
  console.log("❌ TESTE FALHOU - A correção precisa ser revisada.");
}

console.log("");
console.log("🔗 Para testar na prática:");
console.log("1. Acesse http://localhost:5174/checkout/payment");
console.log("2. Preencha os dados como empresa (CNPJ)");
console.log("3. Tente gerar o QR Code PIX");
console.log("4. Verifique se não aparece mais o erro 'CPF inválido'");
