import React, { useEffect } from 'react';
import { MarketplaceFilterProps } from '../types';
import { useMarketplaceFilters } from '../hooks/useMarketplaceFilters';
import { MarketplaceCategoryButton } from '../button-filters/components/category';
import { MarketplaceFilterDropdown } from './MarketplaceFilterDropdown';

export const MarketplaceFilter: React.FC<MarketplaceFilterProps> = ({
  onFiltersChange,
  selectedFilters,
  filterGroups,
  entries = [],
  fields = []
}) => {
  const {
    selectedFilters: internalFilters,
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    handleFilterChange,
    clearFilters,
    getSelectedCount,
    filterOptionsBySearch
  } = useMarketplaceFilters(selectedFilters);

  // Calcular contadores de registros para cada categoria
  const entryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    filterGroups.forEach(group => {
      const field = fields.find(f => f.id === group.id);
      if (field) {
        group.options.forEach(option => {
          counts[option.value] = entries.filter(entry => {
            const fieldValue = entry.values?.[field.id];
            if (Array.isArray(fieldValue)) {
              return fieldValue.includes(option.value);
            }
            return String(fieldValue) === option.value;
          }).length;
        });
      }
    });
    
    return counts;
  }, [entries, fields, filterGroups]);

  // Sync internal filters with external prop
  useEffect(() => {
    onFiltersChange(internalFilters);
  }, [internalFilters, onFiltersChange]);

  const filteredGroups = filterOptionsBySearch(filterGroups);
  const selectedCount = getSelectedCount();

  return (
    <div className="relative">
      <MarketplaceCategoryButton
        selectedCount={selectedCount}
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />
      
      <MarketplaceFilterDropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        filterGroups={filteredGroups}
        selectedFilters={internalFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        entryCounts={entryCounts}
      />
    </div>
  );
};
