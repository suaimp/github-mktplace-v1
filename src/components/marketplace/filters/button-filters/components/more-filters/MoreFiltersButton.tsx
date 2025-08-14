/**
 * Componente do botão "Mais Filtros"
 * Responsabilidade: Renderizar ícone SVG que abre menu com filtros adicionais em telas menores
 */

import React from 'react';
import { PlusCircleIcon } from '../../../../../../icons';

interface MoreFiltersButtonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeFiltersCount: number;
}

export const MoreFiltersButton: React.FC<MoreFiltersButtonProps> = ({
  isOpen,
  onOpenChange,
  activeFiltersCount
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        title="Mais Filtros"
        aria-label="Mais Filtros"
      >
        <PlusCircleIcon className="h-5 w-5" />
        
        {/* Badge de contador quando há filtros ativos */}
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
};
