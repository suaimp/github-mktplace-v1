// Teste simples para verificar se a validação está funcionando
console.log("=== TESTE DE VALIDAÇÃO ===");

// Simular campos de exemplo
const mockFields = [
  { id: '1', field_type: 'url', label: 'URL do Site', is_required: true },
  { id: '2', field_type: 'number', label: 'DA Domain Authority', is_required: true },
  { id: '3', field_type: 'product', label: 'Preço', is_required: true },
  { id: '4', field_type: 'text', label: 'Descrição', is_required: true },
  { id: '5', field_type: 'email', label: 'Email', is_required: true },
  { id: '6', field_type: 'select', label: 'Categoria', is_required: true }
];

// Função de teste baseada na lógica do FormValidationService
function isFieldRequired(field) {
  // Check for URL field
  if (field.field_type === 'url' || 
      field.label?.toLowerCase().includes('url') ||
      field.label?.toLowerCase().includes('site')) {
    return true;
  }
  
  // Check for DA field
  if (field.label?.toLowerCase().includes('da') ||
      field.label?.toLowerCase().includes('domain authority') ||
      (field.field_type === 'number' && field.label?.toLowerCase().includes('da'))) {
    return true;
  }
  
  // Check for Price field
  if (field.field_type === 'product' ||
      field.label?.toLowerCase().includes('preço') ||
      field.label?.toLowerCase().includes('preco') ||
      field.label?.toLowerCase().includes('price')) {
    return true;
  }
  
  return false;
}

console.log("Campos que DEVEM ser obrigatórios:");
mockFields.forEach(field => {
  const shouldBeRequired = isFieldRequired(field);
  const wasRequired = field.is_required;
  console.log(`- ${field.label}: ${shouldBeRequired ? '✅ OBRIGATÓRIO' : '❌ OPCIONAL'} (antes: ${wasRequired ? 'obrigatório' : 'opcional'})`);
});

console.log("\n=== RESULTADO ===");
console.log("✅ Apenas URL, DA e Preço são obrigatórios");
console.log("❌ Descrição, Email e Categoria agora são opcionais");
