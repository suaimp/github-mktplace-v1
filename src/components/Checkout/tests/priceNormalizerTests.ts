/**
 * Testes para a função de normalização de preços
 * Execute no console do navegador para validar o funcionamento
 */

import { normalizePrice, isValidPrice, formatPrice } from '../utils/priceNormalizer';

export function runPriceNormalizerTests() {
  console.log('🧪 Iniciando testes do Price Normalizer...\n');

  const testCases = [
    // Casos de sucesso - formato numérico
    { input: 3794, expected: 3794, description: 'Número inteiro' },
    { input: 3794.50, expected: 3794.50, description: 'Número decimal' },
    
    // Casos de sucesso - formato brasileiro
    { input: "3.794,00", expected: 3794, description: 'Formato brasileiro com vírgula' },
    { input: "R$ 3.794,00", expected: 3794, description: 'Formato brasileiro com R$' },
    { input: "R$3.794,00", expected: 3794, description: 'Formato brasileiro sem espaço' },
    { input: "1.234,56", expected: 1234.56, description: 'Valor menor formato brasileiro' },
    
    // Casos de sucesso - formato americano
    { input: "1234.56", expected: 1234.56, description: 'Formato americano' },
    { input: "3794", expected: 3794, description: 'String numérica simples' },
    
    // Casos de erro - devem retornar 0
    { input: null, expected: 0, description: 'Valor null' },
    { input: undefined, expected: 0, description: 'Valor undefined' },
    { input: "", expected: 0, description: 'String vazia' },
    { input: "abc", expected: 0, description: 'String não numérica' },
    { input: "R$", expected: 0, description: 'Apenas símbolo R$' },
    
    // Casos edge
    { input: "0", expected: 0, description: 'Zero como string' },
    { input: 0, expected: 0, description: 'Zero como número' },
    { input: "R$ 0,00", expected: 0, description: 'Zero formatado' },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = normalizePrice(testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
      console.log(`✅ Teste ${index + 1}: ${testCase.description}`);
      console.log(`   Input: ${JSON.stringify(testCase.input)} → Output: ${result}`);
      passed++;
    } else {
      console.error(`❌ Teste ${index + 1}: ${testCase.description}`);
      console.error(`   Input: ${JSON.stringify(testCase.input)}`);
      console.error(`   Expected: ${testCase.expected}, Got: ${result}`);
      failed++;
    }
  });

  console.log(`\n📊 Resumo dos Testes:`);
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  // Teste das funções auxiliares
  console.log(`\n🔧 Testando funções auxiliares:`);
  
  // isValidPrice
  console.log(`isValidPrice(3794): ${isValidPrice(3794)}`); // true
  console.log(`isValidPrice("R$ 3.794,00"): ${isValidPrice("R$ 3.794,00")}`); // true
  console.log(`isValidPrice(0): ${isValidPrice(0)}`); // false
  console.log(`isValidPrice(null): ${isValidPrice(null)}`); // false
  
  // formatPrice
  console.log(`formatPrice(3794): ${formatPrice(3794)}`);
  console.log(`formatPrice(1234.56): ${formatPrice(1234.56)}`);

  return { passed, failed, total: testCases.length };
}

/**
 * Teste específico para os dados do problema original
 */
export function testOriginalProblemData() {
  console.log('\n🎯 Testando dados do problema original...');
  
  const originalData = [
    {
      "niche": "Cassino e apostas online",
      "price": 3.794
    },
    {
      "niche": "Ações, Forex, criptos, commodities, etc",
      "price": "R$ 3.794,00"
    }
  ];

  originalData.forEach((item, index) => {
    const normalized = normalizePrice(item.price);
    console.log(`Item ${index + 1}: ${item.niche}`);
    console.log(`  Original: ${JSON.stringify(item.price)} (${typeof item.price})`);
    console.log(`  Normalizado: ${normalized} (number)`);
    console.log(`  Válido: ${isValidPrice(item.price)}`);
    console.log('');
  });
}

// Função para executar todos os testes
export function runAllTests() {
  const results = runPriceNormalizerTests();
  testOriginalProblemData();
  
  return results;
}
