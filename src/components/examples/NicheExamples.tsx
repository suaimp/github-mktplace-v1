// Exemplo de como os nichos aparecerão em um formulário real

import React from 'react';
import { CompactNiche } from '../form/NicheDisplay';
import type { NicheOption } from '../../context/db-context/services/formFieldNicheService';

// Exemplo de nichos configurados
const exampleNiches: NicheOption[] = [
  { text: "Cassino", icon: "ShoppingCartIcon" },
  { text: "Tecnologia", icon: "BoltIcon" },
  { text: "Saúde", icon: "UserIcon" },
  { text: "Educação", icon: "DocsIcon" },
  { text: "Finanças", icon: "DollarLineIcon" }
];

export function ExampleNicheUsage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Exemplo: Nichos com Ícones
      </h2>
      
      {/* Exibição em lista compacta */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tags Compactas
        </h3>
        <div className="flex flex-wrap gap-2">
          {exampleNiches.map((niche, index) => (
            <CompactNiche key={index} niche={niche} />
          ))}
        </div>
      </div>
      
      {/* Exibição em cards */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Cards Selecionáveis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exampleNiches.map((niche, index) => {
            const IconComponent = getIconComponent(niche.icon);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer transition-colors"
              >
                {IconComponent && (
                  <IconComponent className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                )}
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {niche.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Exibição em lista vertical */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Lista Vertical
        </h3>
        <div className="space-y-2">
          {exampleNiches.map((niche, index) => {
            const IconComponent = getIconComponent(niche.icon);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center">
                  {IconComponent && (
                    <IconComponent className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  )}
                </div>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {niche.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Função helper para obter componente do ícone
function getIconComponent(iconName?: string) {
  if (!iconName) return null;
  
  // Importação dinâmica dos ícones
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    ShoppingCartIcon: require('../../icons').ShoppingCartIcon,
    BoltIcon: require('../../icons').BoltIcon,
    UserIcon: require('../../icons').UserIcon,
    DocsIcon: require('../../icons').DocsIcon,
    DollarLineIcon: require('../../icons').DollarLineIcon,
    // Adicione outros ícones conforme necessário
  };
  
  return iconMap[iconName] || null;
}
