/**
 * Componente base para dropdowns de filtro
 * Responsabilidade: Estrutura reutilizável para todos os dropdowns de filtro
 */

import React, { ReactNode } from 'react';

interface BaseFilterDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  hasSelectedItems: boolean;
  onClearFilters: () => void;
  children: ReactNode;
  emptyMessage?: string;
}

export const BaseFilterDropdown: React.FC<BaseFilterDropdownProps> = ({
  isOpen,
  onOpenChange,
  title,
  searchPlaceholder,
  searchTerm,
  onSearchChange,
  hasSelectedItems,
  onClearFilters,
  children,
  emptyMessage = "Nenhum item encontrado"
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
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
      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[280px] max-w-[400px] z-50">
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex h-full w-full flex-col overflow-hidden rounded-md">
          {/* Search Header */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2 h-4 w-4 shrink-0 opacity-50"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="placeholder:text-gray-400 dark:placeholder:text-gray-500 flex h-[30px] w-full rounded-md bg-transparent py-3 text-sm outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col">
            {/* Scrollable content area */}
            <div className="overflow-y-auto" style={{ maxHeight: '364px' }}>
              <div className="p-1">
                {children}
              </div>
            </div>
            
            {/* Clear filters button - outside scroll */}
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
