/**
 * Componente base para dropdowns de filtro de range
 * Responsabilidade: Estrutura reutilizável para filtros baseados em faixas de valores
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { CustomRange } from './types/RangeFilterTypes';

interface BaseRangeFilterDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customRangeTitle?: string;
  applyButtonText?: string;
  customRange: CustomRange;
  onCustomRangeChange: (range: CustomRange) => void;
  onApplyCustomRange: () => void;
  hasSelectedItems: boolean;
  onClearFilters: () => void;
  children: ReactNode;
}

export const BaseRangeFilterDropdown: React.FC<BaseRangeFilterDropdownProps> = ({
  isOpen,
  onOpenChange,
  customRangeTitle = "Intervalo personalizado",
  applyButtonText = "Aplicar",
  customRange,
  onCustomRangeChange,
  onApplyCustomRange,
  hasSelectedItems,
  onClearFilters,
  children
}) => {
  // Estados locais para os inputs
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');

  // Sincronizar com o customRange do props apenas quando necessário
  useEffect(() => {
    const newMinValue = customRange.min !== null ? customRange.min.toString() : '';
    const newMaxValue = customRange.max !== null ? customRange.max.toString() : '';
    
    // Só atualiza se os valores realmente mudaram
    if (newMinValue !== minValue) {
      setMinValue(newMinValue);
    }
    if (newMaxValue !== maxValue) {
      setMaxValue(newMaxValue);
    }
  }, [customRange.min, customRange.max]); // Dependências específicas para evitar loop

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleMinValueChange = (value: string) => {
    setMinValue(value);
    const numValue = value === '' ? null : parseInt(value, 10);
    const finalValue = isNaN(numValue!) ? null : numValue;
    onCustomRangeChange({
      ...customRange,
      min: finalValue
    });
  };

  const handleMaxValueChange = (value: string) => {
    setMaxValue(value);
    const numValue = value === '' ? null : parseInt(value, 10);
    onCustomRangeChange({
      ...customRange,
      max: isNaN(numValue!) ? null : numValue
    });
  };

  const incrementValue = (type: 'min' | 'max', increment: number) => {
    if (type === 'min') {
      const currentValue = parseInt(minValue, 10) || 0;
      const newValue = Math.max(0, Math.min(100, currentValue + increment));
      const newValueStr = newValue.toString();
      setMinValue(newValueStr);
      onCustomRangeChange({ ...customRange, min: newValue });
    } else {
      const currentValue = parseInt(maxValue, 10) || 0;
      const newValue = Math.max(0, Math.min(100, currentValue + increment));
      const newValueStr = newValue.toString();
      setMaxValue(newValueStr);
      onCustomRangeChange({ ...customRange, max: newValue });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
      />
      
      {/* Dropdown */}
      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[320px] max-w-[400px] z-50">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex h-full w-full flex-col overflow-hidden rounded-md">
          
          {/* Layout principal */}
          <div className="flex flex-col">
            {/* Seção de opções predefinidas */}
            <div className="flex flex-col">
              {/* Scrollable content area */}
              <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                <div className="p-1">
                  {children}
                </div>
              </div>
            </div>

            {/* Seção de intervalo personalizado */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="space-y-3">
                <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                  {customRangeTitle}
                </div>
                
                {/* Range inputs */}
                <div className="flex gap-2">
                  {/* Input De */}
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="De"
                        min="0"
                        max="100"
                        value={minValue}
                        onChange={(e) => handleMinValueChange(e.target.value)}
                        className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col pointer-events-none">
                        <button
                          type="button"
                          onClick={() => incrementValue('min', 1)}
                          className="h-4 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm pointer-events-auto border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                          aria-label="Aumentar valor mínimo"
                        >
                          <svg height="6" width="10" fill="currentColor" viewBox="0 0 10 6" className="text-gray-600 dark:text-gray-300">
                            <path d="M0,6l5,-6l5,6Z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => incrementValue('min', -1)}
                          className="h-4 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm pointer-events-auto border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mt-0.5"
                          aria-label="Diminuir valor mínimo"
                        >
                          <svg height="6" width="10" fill="currentColor" viewBox="0 0 10 6" className="text-gray-600 dark:text-gray-300">
                            <path d="M0,0l10,0l-5,6Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Input Até */}
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Até"
                        min="0"
                        max="100"
                        value={maxValue}
                        onChange={(e) => handleMaxValueChange(e.target.value)}
                        className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col pointer-events-none">
                        <button
                          type="button"
                          onClick={() => incrementValue('max', 1)}
                          className="h-4 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm pointer-events-auto border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                          aria-label="Aumentar valor máximo"
                        >
                          <svg height="6" width="10" fill="currentColor" viewBox="0 0 10 6" className="text-gray-600 dark:text-gray-300">
                            <path d="M0,6l5,-6l5,6Z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => incrementValue('max', -1)}
                          className="h-4 w-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm pointer-events-auto border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 mt-0.5"
                          aria-label="Diminuir valor máximo"
                        >
                          <svg height="6" width="10" fill="currentColor" viewBox="0 0 10 6" className="text-gray-600 dark:text-gray-300">
                            <path d="M0,0l10,0l-5,6Z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão Aplicar */}
                <button
                  type="button"
                  onClick={onApplyCustomRange}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {applyButtonText}
                </button>
              </div>
            </div>

            {/* Clear filters button */}
            {hasSelectedItems && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700" />
                <div className="p-1">
                  <div 
                    className="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 text-sm outline-none select-none justify-center text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-[30px] focus:outline-none"
                    onClick={onClearFilters}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClearFilters();
                      }
                    }}
                  >
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Limpar filtros</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
