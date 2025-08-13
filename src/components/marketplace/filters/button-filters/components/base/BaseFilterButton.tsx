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
      className="inline-flex items-center gap-2 rounded-lg bg-white text-xs px-3 py-3 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] h-10"
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={ariaLabel || `Filtrar por ${label.toLowerCase()}${selectedCount > 0 ? ` (${selectedCount} selecionados)` : ''}`}
      onClick={onClick}
    >
      {icon && (
        <span className="mr-2 h-4 w-4">
          {icon}
        </span>
      )}
      {label}
      {selectedCount > 0 && (
        <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
          {selectedCount}
        </span>
      )}
    </button>
  );
};
