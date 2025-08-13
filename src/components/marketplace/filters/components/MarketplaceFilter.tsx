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
      if (group.id === 'category') {
        // Para categorias, usar a mesma lógica de identificação do campo que filterUtils.tsx
        const categoryField = fields.find(field => 
          field.field_type === "categories" || 
          field.field_type === "category" ||
          (field.field_type === "multiselect" && field.label?.toLowerCase().includes('categoria')) ||
          field.label?.toLowerCase().includes('categoria') ||
          field.label?.toLowerCase().includes('category') ||
          field.label?.toLowerCase().includes('nicho') ||
          field.label?.toLowerCase().includes('niche')
        );
        
        if (categoryField) {
          group.options.forEach(option => {
            counts[option.value] = entries.filter(entry => {
              const fieldValue = entry.values?.[categoryField.id];
              
              if (fieldValue) {
                // Tentar diferentes formatos de dados (mesma lógica do filterUtils)
                let categories: string[] = [];
                
                if (Array.isArray(fieldValue)) {
                  categories = fieldValue.map(item => {
                    if (typeof item === 'string') {
                      return item.trim();
                    } else if (typeof item === 'object' && item !== null) {
                      return item.name || item.label || item.title || item.value || item.toString();
                    } else {
                      return item.toString().trim();
                    }
                  });
                } else if (typeof fieldValue === 'string') {
                  if (fieldValue.includes(',')) {
                    categories = fieldValue.split(',').map(cat => cat.trim());
                  } else if (fieldValue.includes(';')) {
                    categories = fieldValue.split(';').map(cat => cat.trim());
                  } else if (fieldValue.includes('|')) {
                    categories = fieldValue.split('|').map(cat => cat.trim());
                  } else {
                    categories = [fieldValue.trim()];
                  }
                } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                  categories = [fieldValue.name || fieldValue.label || fieldValue.title || fieldValue.value || fieldValue.toString()];
                } else {
                  categories = [fieldValue.toString().trim()];
                }
                
                // Verificar se alguma categoria corresponde ao valor da opção
                return categories.some(cat => {
                  const lowerCat = cat.toLowerCase();
                  const lowerOption = option.value.toLowerCase();
                  return lowerCat === lowerOption;
                });
              }
              
              return false;
            }).length;
          });
        }
      } else {
        // Para outros tipos de filtro, usar a lógica original
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
