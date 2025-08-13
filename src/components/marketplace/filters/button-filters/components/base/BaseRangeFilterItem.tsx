/**
 * Componente base para itens de filtro de range
 * Responsabilidade: Renderizar itens individuais com classificação e checkbox
 */

import React from 'react';
import { RangeOption } from './types/RangeFilterTypes';

interface BaseRangeFilterItemProps {
  option: RangeOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  showInfo?: boolean;
}

export const BaseRangeFilterItem: React.FC<BaseRangeFilterItemProps> = ({
  option,
  isSelected,
  onSelect,
  showInfo = false
}) => {
  const handleClick = () => {
    onSelect(option.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(option.id);
    }
  };

  return (
    <div
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
    >
      {/* Checkbox */}
      <div className="flex items-center">
        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-between">
        {/* Classificação com badge */}
        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center justify-center w-6 h-6 rounded-sm font-bold text-xs transition-colors duration-200"
            style={{
              backgroundColor: option.backgroundColor,
              color: option.textColor
            }}
          >
            {option.badgeText || option.id}
          </div>
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {option.label}
          </span>
        </div>

        {/* Range de pontuação */}
        <div className="flex items-center gap-1">
          {showInfo && option.description && (
            <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" title={option.description}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M7.82 6a1 1 0 0 1 .99 1.16L8 12h2a1 1 0 1 1 0 2H7.18a1 1 0 0 1-.99-1.16L7 8H6a1 1 0 0 1 0-2h1.82ZM8.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
              </svg>
            </div>
          )}
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {option.description || `${option.minValue}–${option.maxValue}`}
          </span>
        </div>
      </div>
    </div>
  );
};
