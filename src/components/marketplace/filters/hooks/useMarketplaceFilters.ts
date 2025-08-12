import { useState, useCallback } from 'react';
import { FilterGroup } from '../types';

export const useMarketplaceFilters = (initialFilters: Record<string, string[]> = {}) => {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = useCallback((groupId: string, optionId: string, selected: boolean) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[groupId] || [];
      
      if (selected) {
        // Adicionar filtro se não existir
        if (!groupFilters.includes(optionId)) {
          return {
            ...prev,
            [groupId]: [...groupFilters, optionId]
          };
        }
      } else {
        // Remover filtro
        const newGroupFilters = groupFilters.filter(id => id !== optionId);
        if (newGroupFilters.length === 0) {
          const { [groupId]: removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [groupId]: newGroupFilters
        };
      }
      
      return prev;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters({});
  }, []);

  const getSelectedCount = useCallback(() => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0);
  }, [selectedFilters]);

  const filterOptionsBySearch = useCallback((filterGroups: FilterGroup[]) => {
    if (!searchTerm) return filterGroups;
    
    return filterGroups.map(group => ({
      ...group,
      options: group.options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.options.length > 0);
  }, [searchTerm]);

  return {
    selectedFilters,
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    handleFilterChange,
    clearFilters,
    getSelectedCount,
    filterOptionsBySearch
  };
};
