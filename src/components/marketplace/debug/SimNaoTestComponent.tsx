import React from 'react';
import { renderUnifiedBadge } from '../services/unifiedBadgeRenderer';

/**
 * Componente de teste para verificar especificamente valores Sim/Não
 */
export function SimNaoTestComponent() {
  console.log('🧪 [SimNaoTest] Component mounted');

  const testCases = [
    { 
      label: 'Teste Sim - Radio Patrocinado', 
      value: 'Sim', 
      fieldType: 'radio', 
      fieldLabel: 'Artigo é patrocinado' 
    },
    { 
      label: 'Teste Não - Radio Patrocinado', 
      value: 'Não', 
      fieldType: 'radio', 
      fieldLabel: 'Artigo é patrocinado' 
    },
    { 
      label: 'Teste Sim - Toggle', 
      value: true, 
      fieldType: 'toggle', 
      fieldLabel: 'Artigo é patrocinado' 
    },
    { 
      label: 'Teste Não - Toggle', 
      value: false, 
      fieldType: 'toggle', 
      fieldLabel: 'Artigo é patrocinado' 
    },
    { 
      label: 'Teste Sim - Select', 
      value: 'Sim', 
      fieldType: 'select', 
      fieldLabel: 'Artigo é patrocinado' 
    },
    { 
      label: 'Teste Não - Select', 
      value: 'Não', 
      fieldType: 'select', 
      fieldLabel: 'Artigo é patrocinado' 
    }
  ];

  React.useEffect(() => {
    console.log('🧪 [SimNaoTest] Running manual tests...');
    
    testCases.forEach((testCase, index) => {
      console.log(`\n=== TESTE ${index + 1}: ${testCase.label} ===`);
      const result = renderUnifiedBadge(testCase.value, testCase.fieldType, testCase.fieldLabel);
      console.log('🎯 [SimNaoTest] Result:', result);
      console.log('🎯 [SimNaoTest] Result type:', typeof result);
      console.log('🎯 [SimNaoTest] Is React element?', React.isValidElement(result));
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold text-yellow-800 mb-3">🧪 Teste Sim/Não</h3>
      
      <div className="space-y-2 text-sm">
        {testCases.map((testCase, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
            <span className="text-gray-700 font-medium">
              {testCase.label}
            </span>
            <div className="ml-2">
              {renderUnifiedBadge(testCase.value, testCase.fieldType, testCase.fieldLabel)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-yellow-700">
        ⚠️ Verifique o console para logs detalhados
      </div>
    </div>
  );
}

// Função para adicionar o componente temporariamente na página
export function addSimNaoTest() {
  const existingTest = document.getElementById('sim-nao-test');
  if (existingTest) {
    existingTest.remove();
  }

  const testDiv = document.createElement('div');
  testDiv.id = 'sim-nao-test';
  document.body.appendChild(testDiv);
  
  // Renderizar o componente usando React
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(testDiv);
    root.render(React.createElement(SimNaoTestComponent));
  });
}
