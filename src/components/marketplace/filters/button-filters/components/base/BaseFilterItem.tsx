/**
 * Componente base para itens de filtro
 * Responsabilidade: Item reutilizável para qualquer tipo de filtro
 */

import React, { ReactNode } from 'react';

interface BaseFilterItemProps {
  id: string;
  label: string;
  isSelected: boolean;
  onToggle: (id: string, selected: boolean) => void;
  icon?: ReactNode;
  secondaryInfo?: string | number;
  className?: string;
}

export const BaseFilterItem: React.FC<BaseFilterItemProps> = ({
  id,
  label,
  isSelected,
  onToggle,
  icon,
  secondaryInfo,
  className = ''
}) => {
  const handleClick = () => {
    onToggle(id, !isSelected);
  };

  return (
    <div
      className={`
        relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm 
        outline-hidden select-none hover:bg-gray-100 dark:hover:bg-gray-800
        ${isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''} ${className}
      `}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
    >
      {/* Checkbox */}
      <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300 dark:border-gray-600">
        {isSelected && (
          <svg 
            width="15" 
            height="15" 
            viewBox="0 0 15 15" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-brand-600"
          >
            <path 
              d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" 
              fill="currentColor" 
              fillRule="evenodd" 
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Icon */}
      {icon && (
        <div className="text-gray-500 dark:text-gray-400 mr-2 h-4 w-4">
          {icon}
        </div>
      )}

      {/* Label */}
      <span className="text-gray-900 dark:text-gray-100 flex-1">{label}</span>

      {/* Secondary Info (count, code, etc.) */}
      {secondaryInfo !== undefined && (
        <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs text-gray-500 dark:text-gray-400">
          {secondaryInfo}
        </span>
      )}
    </div>
  );
};
