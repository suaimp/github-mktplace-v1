/**
 * Niche Filter Hook
 * Responsability: State management for niche filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { NicheFilterService } from '../services/NicheFilterService';
import { NicheDebugService } from '../services/NicheDebugService';
import { 
  NicheFilterState, 
  UseNicheFilterReturn, 
  NicheSite 
} from '../types/NicheFilterTypes';

/**
 * Hook for managing niche filter state and operations
 */
export function useNicheFilter(entries: NicheSite[], fields?: any[]): UseNicheFilterReturn {
  
  // State management
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract all niches with counts from entries
  const allNiches = useMemo(() => {
    console.log('[useNicheFilter] Extracting niches from entries:', entries.length);
    console.log('[useNicheFilter] Fields provided:', fields?.length || 0);
    console.log('[useNicheFilter] Sample entries:', entries.slice(0, 3));
    
    // Debug: Log detailed structure of first few entries
    entries.slice(0, 2).forEach((entry, index) => {
      console.log(`[useNicheFilter] Entry ${index} detailed structure:`, {
        id: entry.id,
        hasValues: !!entry.values,
        valuesKeys: entry.values ? Object.keys(entry.values) : [],
        values: entry.values,
        directProps: {
          niche: entry.niche,
          niches: entry.niches,
          category: entry.category,
          categories: entry.categories
        }
      });
      
      // Log each field in values if exists
      if (entry.values) {
        Object.entries(entry.values).forEach(([key, value]) => {
          console.log(`[useNicheFilter] Entry ${index} field "${key}":`, {
            type: typeof value,
            value: value,
            isArray: Array.isArray(value),
            stringLength: typeof value === 'string' ? value.length : undefined
          });
        });
      }
    });

    // Debug field metadata
    if (fields && fields.length > 0) {
      console.log('[useNicheFilter] Field metadata:', fields.map(f => ({
        id: f.id,
        field_type: f.field_type,
        label: f.label
      })));
      
      const nicheFields = fields.filter(f => f.field_type === 'niche');
      console.log('[useNicheFilter] Niche fields found:', nicheFields.map(f => ({
        id: f.id,
        label: f.label
      })));
    }
    
    // Debug entries to understand structure
    NicheDebugService.debugEntries(entries);
    
    const result = NicheFilterService.extractNichesWithCounts(entries, fields);
    console.log('[useNicheFilter] Extracted niches result:', result);
    
    return result;
  }, [entries, fields]);

  // Filter niches by search term
  const filteredNiches = useMemo(() => {
    return NicheFilterService.filterNichesBySearch(allNiches, searchTerm)
      .map(niche => ({
        ...niche,
        isSelected: selectedNiches.includes(niche.text)
      }));
  }, [allNiches, searchTerm, selectedNiches]);

  // Toggle niche selection
  const toggleNiche = useCallback((nicheText: string) => {
    setSelectedNiches(prev => {
      if (prev.includes(nicheText)) {
        return prev.filter(n => n !== nicheText);
      } else {
        return [...prev, nicheText];
      }
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedNiches([]);
  }, []);

  // Check if filter is active
  const isActive = useMemo(() => {
    return selectedNiches.length > 0;
  }, [selectedNiches]);

  // Get filter function for marketplace table
  const getFilterFunction = useCallback(() => {
    if (selectedNiches.length === 0) {
      return null;
    }

    return NicheFilterService.createFilterFunction({
      selectedNiches
    }, fields);
  }, [selectedNiches]);

  // Get active filters count
  const getActiveFiltersCount = useCallback((): number => {
    return selectedNiches.length;
  }, [selectedNiches]);

  // Get active filters text
  const getActiveFiltersText = useCallback((): string => {
    return NicheFilterService.getActiveFiltersText(selectedNiches);
  }, [selectedNiches]);

  // Computed state
  const state: NicheFilterState = useMemo(() => ({
    selectedNiches,
    isOpen,
    searchTerm,
    allNiches
  }), [selectedNiches, isOpen, searchTerm, allNiches]);

  return {
    state,
    isOpen,
    searchTerm,
    selectedCount: selectedNiches.length,
    filteredNiches,
    setIsOpen,
    setSearchTerm,
    toggleNiche,
    clearFilters,
    isActive,
    getFilterFunction,
    getActiveFiltersCount,
    getActiveFiltersText
  };
}
