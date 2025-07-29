// Teste do novo formato de nome de arquivo

function generateFileName(formTitle, statusDisplayName, searchTerm) {
  // Usar o título do formulário como base
  let fileName = formTitle;
  
  // Adicionar status se não for "Todos os Status"
  if (statusDisplayName && statusDisplayName !== 'Todos os Status') {
    fileName += ` (${statusDisplayName})`;
  }
  
  // Adicionar busca se houver
  if (searchTerm && searchTerm.trim()) {
    fileName += ` - Busca: ${searchTerm.substring(0, 20)}`;
  }

  return `${fileName}.pdf`;
}

// Testes
console.log('=== NOVOS NOMES DE ARQUIVO ===\n');

console.log('1. Todos os registros:');
console.log(generateFileName('Cadastro de sites', 'Todos os Status', ''));

console.log('\n2. Filtro "Verificado":');
console.log(generateFileName('Cadastro de sites', 'Verificado', ''));

console.log('\n3. Filtro "Em Análise":');
console.log(generateFileName('Cadastro de sites', 'Em Análise', ''));

console.log('\n4. Filtro "Reprovado":');
console.log(generateFileName('Cadastro de sites', 'Reprovado', ''));

console.log('\n5. Busca "g1" em todos:');
console.log(generateFileName('Cadastro de sites', 'Todos os Status', 'g1'));

console.log('\n6. Busca "globo" no filtro "Verificado":');
console.log(generateFileName('Cadastro de sites', 'Verificado', 'globo'));

console.log('\n7. Busca com termo longo:');
console.log(generateFileName('Cadastro de sites', 'Em Análise', 'este é um termo muito longo'));
