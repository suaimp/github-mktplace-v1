/**
 * Componente base para botões de filtro
 * Responsabilidade: Botão reutilizável para qualquer tipo de filtro
 */

import React, { ReactNode } from 'react';

interface BaseFilterButtonProps {
  selectedCount: number;
  onClick: () => void;
  isOpen: boolean;
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
}

export const BaseFilterButton: React.FC<BaseFilterButtonProps> = ({
  selectedCount,
  onClick,
  isOpen,
  label,
  icon,
  ariaLabel
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors 
        focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand-500 
        disabled:pointer-events-none disabled:opacity-50 
        [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 
        border border-gray-300 dark:border-gray-700 
        bg-white dark:bg-gray-800 
        shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 
        hover:text-gray-900 dark:hover:text-gray-100
        rounded-md px-3 text-xs hidden h-11 lg:flex
        ${isOpen ? 'bg-gray-50 dark:bg-gray-700' : ''}
        ${selectedCount > 0 ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300'}
      `}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={ariaLabel || `Filtrar por ${label.toLowerCase()}${selectedCount > 0 ? ` (${selectedCount} selecionados)` : ''}`}
    >
      {icon}
      {label}
      {selectedCount > 0 && (
        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-medium">
          {selectedCount}
        </span>
      )}
    </button>
  );
};
