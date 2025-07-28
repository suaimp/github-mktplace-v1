/**
 * Arquivo de teste para validar a funcionalidade de busca de preços
 * Para usar: Abra o console do navegador e execute os comandos de teste
 */

// Importa as funções para teste no console
// window.testPriceSearch = {
//   extractPriceForSearch: require('./priceUtils').extractPriceForSearch
// };

// Casos de teste para validação manual
export const priceTestCases = [
  // Casos de JSON string
  {
    input: '{"price": "R$ 100,00"}',
    expected: ['100', '100.00', 'R$ 100,00'],
    description: 'JSON com preço formatado brasileiro'
  },
  {
    input: '{"price": 150.50, "promotional_price": 120.00}',
    expected: ['150.5', '150.50', 'R$ 150,50', '120', '120.00', 'R$ 120,00'],
    description: 'JSON com preço normal e promocional'
  },
  // Casos de string direta
  {
    input: 'R$ 75,90',
    expected: ['75.9', '75.90', 'R$ 75,90'],
    description: 'String de preço formatado'
  },
  {
    input: '200.00',
    expected: ['200', '200.00', 'R$ 200,00'],
    description: 'String de preço decimal'
  },
  // Casos de objeto
  {
    input: { price: 300, promotional_price: 250 },
    expected: ['300', '300.00', 'R$ 300,00', '250', '250.00', 'R$ 250,00'],
    description: 'Objeto com preços numéricos'
  },
  // Casos especiais
  {
    input: null,
    expected: [],
    description: 'Valor null'
  },
  {
    input: '',
    expected: [],
    description: 'String vazia'
  }
];

console.log('🧪 Casos de teste de busca de preços carregados:', priceTestCases);
