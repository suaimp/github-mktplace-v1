// Teste para verificar como os nomes de arquivo serão gerados

function generateFileName(formTitle, statusDisplayName, searchTerm) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  const sanitizedTitle = formTitle
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();

  // Adicionar filtro ao nome do arquivo
  let filterPart = '';
  if (statusDisplayName && statusDisplayName !== 'Todos os Status') {
    filterPart = `_${statusDisplayName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  }

  // Adicionar busca ao nome do arquivo
  let searchPart = '';
  if (searchTerm && searchTerm.trim()) {
    const sanitizedSearch = searchTerm
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase()
      .substring(0, 20); // Limitar tamanho
    searchPart = `_busca_${sanitizedSearch}`;
  }

  return `${sanitizedTitle}${filterPart}${searchPart}_${dateStr}_${timeStr}.pdf`;
}

// Testes
console.log('=== EXEMPLOS DE NOMES DE ARQUIVO ===\n');

console.log('1. Todos os registros:');
console.log(generateFileName('Formulário de Sites', 'Todos os Status', ''));

console.log('\n2. Filtro "Verificado":');
console.log(generateFileName('Formulário de Sites', 'Verificado', ''));

console.log('\n3. Filtro "Em Análise":');
console.log(generateFileName('Formulário de Sites', 'Em Análise', ''));

console.log('\n4. Busca "g1" em todos:');
console.log(generateFileName('Formulário de Sites', 'Todos os Status', 'g1'));

console.log('\n5. Busca "globo" no filtro "Verificado":');
console.log(generateFileName('Formulário de Sites', 'Verificado', 'globo'));

console.log('\n6. Busca com caracteres especiais:');
console.log(generateFileName('Formulário de Sites', 'Reprovado', 'site@teste.com'));

console.log('\n7. Busca muito longa (será cortada):');
console.log(generateFileName('Formulário de Sites', 'Em Análise', 'este é um termo de busca muito longo que será cortado'));
