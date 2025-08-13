import React from 'react';
import { FilterDropdownProps } from '../types';
import { BaseFilterDropdown, BaseFilterItem } from '../button-filters/components/base';

export const MarketplaceFilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onOpenChange,
  filterGroups,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  searchTerm,
  onSearchChange,
  entryCounts = {}
}) => {
  // Calcular se há filtros selecionados
  const hasSelectedFilters = Object.values(selectedFilters).some(filters => filters.length > 0);

  return (
    <BaseFilterDropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filtrar por Categoria"
      searchPlaceholder="Buscar categorias..."
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      hasSelectedItems={hasSelectedFilters}
      onClearFilters={onClearFilters}
      emptyMessage="Nenhuma categoria encontrada"
    >
      {filterGroups.length > 0 ? (
        filterGroups.map((group) => (
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
                  <BaseFilterItem
                    key={option.id}
                    id={option.value}
                    label={option.label}
                    isSelected={isSelected}
                    onToggle={(optionId) => onFilterChange(group.id, optionId, !isSelected)}
                    secondaryInfo={entryCounts[option.value] || 0}
                  />
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Nenhuma categoria encontrada
        </div>
      )}
    </BaseFilterDropdown>
  );
};
