import React from 'react';
import { FilterDropdownProps } from '../types';
import { MarketplaceFilterItem } from './MarketplaceFilterItem';

export const MarketplaceFilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onOpenChange,
  filterGroups,
  selectedFilters,
  onFilterChange,
  searchTerm,
  onSearchChange
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-start"
      onClick={handleBackdropClick}
    >
      <div className="absolute top-16 left-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg min-w-[280px] max-w-[400px]">
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
              className="placeholder:text-gray-400 dark:placeholder:text-gray-500 flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          {/* Filter Options */}
          <div className="max-h-[300px] overflow-x-hidden overflow-y-auto">
            <div className="p-1">
              {filterGroups.map((group) => (
                <div key={group.id} className="mb-2">
                  {group.label && (
                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {group.label}
                    </div>
                  )}
                  <div>
                    {group.options.map((option) => {
                      const isSelected = selectedFilters[group.id]?.includes(option.value) || false;
                      return (
                        <MarketplaceFilterItem
                          key={option.id}
                          option={option}
                          isSelected={isSelected}
                          onToggle={(optionId, selected) => onFilterChange(group.id, optionId, selected)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {filterGroups.length === 0 && (
                <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma categoria encontrada
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
