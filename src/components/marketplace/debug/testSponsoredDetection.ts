import { detectValueType, isSponsoredValue } from '../services/valueTypeDetection';

// Teste para reproduzir o problema de renderização Sim/Não
console.log('=== TESTE DE DETECÇÃO DE VALORES SIM/NÃO ===\n');

// Casos de teste
const testCases = [
  {
    name: 'Toggle true',
    value: true,
    fieldType: 'toggle',
    fieldLabel: 'Artigo Patrocinado'
  },
  {
    name: 'Toggle false', 
    value: false,
    fieldType: 'toggle',
    fieldLabel: 'Artigo Patrocinado'
  },
  {
    name: 'Radio "Sim"',
    value: 'Sim',
    fieldType: 'radio',
    fieldLabel: 'Artigo Patrocinado'
  },
  {
    name: 'Radio "Não"',
    value: 'Não', 
    fieldType: 'radio',
    fieldLabel: 'Artigo Patrocinado'
  },
  {
    name: 'Text "Sim" com label patrocinado',
    value: 'Sim',
    fieldType: 'text',
    fieldLabel: 'Artigo Patrocinado'
  },
  {
    name: 'Text "Não" com label patrocinado',
    value: 'Não',
    fieldType: 'text', 
    fieldLabel: 'Artigo Patrocinado'
  },
  {
    name: 'Text "Sim" sem label específico',
    value: 'Sim',
    fieldType: 'text',
    fieldLabel: 'Algum Campo'
  },
  {
    name: 'Text "Não" sem label específico',
    value: 'Não',
    fieldType: 'text',
    fieldLabel: 'Algum Campo'
  }
];

testCases.forEach(testCase => {
  console.log(`\n--- ${testCase.name} ---`);
  console.log(`Valor: "${testCase.value}" (${typeof testCase.value})`);
  console.log(`Tipo do campo: ${testCase.fieldType}`);
  console.log(`Label do campo: ${testCase.fieldLabel}`);
  
  // Testar detecção de tipo
  const valueType = detectValueType(testCase.value, testCase.fieldType, testCase.fieldLabel);
  console.log(`Tipo detectado: ${valueType}`);
  
  // Testar se é valor patrocinado
  const isSponsored = isSponsoredValue(testCase.fieldType, testCase.value);
  console.log(`É valor patrocinado: ${isSponsored}`);
  
  // Simular qual seria o resultado final
  let resultado = '';
  
  if (testCase.fieldType === 'toggle') {
    resultado = 'Badge via case toggle';
  } else if (testCase.fieldType === 'radio' && (testCase.value === 'Sim' || testCase.value === 'Não')) {
    resultado = 'Badge via case radio';
  } else if (valueType === 'sponsored') {
    resultado = 'Badge via SponsoredBadge component';
  } else {
    resultado = 'Texto simples';
  }
  
  console.log(`Resultado esperado: ${resultado}`);
});

console.log('\n=== FIM DO TESTE ===');
