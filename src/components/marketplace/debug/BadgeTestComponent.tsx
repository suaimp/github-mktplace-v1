 
import { renderUnifiedBadge } from '../services/unifiedBadgeRenderer';

/**
 * Componente de teste para verificar a renderização de badges Sim/Não
 */
export function BadgeTestComponent() {
  const testCases = [
    { label: 'Toggle true', value: true, fieldType: 'toggle', fieldLabel: 'Artigo Patrocinado' },
    { label: 'Toggle false', value: false, fieldType: 'toggle', fieldLabel: 'Artigo Patrocinado' },
    { label: 'Radio "Sim"', value: 'Sim', fieldType: 'radio', fieldLabel: 'Artigo Patrocinado' },
    { label: 'Radio "Não"', value: 'Não', fieldType: 'radio', fieldLabel: 'Artigo Patrocinado' },
    { label: 'Text "Sim" patrocinado', value: 'Sim', fieldType: 'text', fieldLabel: 'Artigo Patrocinado' },
    { label: 'Text "Não" patrocinado', value: 'Não', fieldType: 'text', fieldLabel: 'Artigo Patrocinado' },
    { label: 'Text "Sim" genérico', value: 'Sim', fieldType: 'text', fieldLabel: 'Outro Campo' },
    { label: 'Text "Não" genérico', value: 'Não', fieldType: 'text', fieldLabel: 'Outro Campo' },
    { label: 'Select "Sim"', value: 'Sim', fieldType: 'select', fieldLabel: 'Campo Select' },
    { label: 'Select "Não"', value: 'Não', fieldType: 'select', fieldLabel: 'Campo Select' },
  ];

  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Teste de Renderização de Badges Sim/Não
      </h2>
      
      <div className="space-y-3">
        {testCases.map((testCase, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {testCase.label}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Value: {JSON.stringify(testCase.value)} | Type: {testCase.fieldType} | Label: {testCase.fieldLabel}
              </div>
            </div>
            
            <div className="ml-4">
              {renderUnifiedBadge(testCase.value, testCase.fieldType, testCase.fieldLabel)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Resultado Esperado:
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Todos os valores "Sim" devem aparecer com badge verde</li>
          <li>• Todos os valores "Não" devem aparecer com badge laranja/amarelo</li>
          <li>• Não deve haver diferença entre toggle, radio, text, select etc.</li>
          <li>• A detecção deve funcionar independente do tipo de campo</li>
        </ul>
      </div>
    </div>
  );
}
