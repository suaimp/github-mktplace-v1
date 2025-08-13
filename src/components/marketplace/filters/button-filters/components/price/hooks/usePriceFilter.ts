import { useState, useCallback, useMemo } from 'react';
import { PriceFilterState, PriceFilterCriteria, PriceRangeItem, UsePriceFilterReturn, PriceSite } from '../types/PriceFilterTypes';
import { CustomRange } from '../../base/types/RangeFilterTypes';
import { PriceFilterService } from '../services/PriceFilterService';

/**
 * Hook for managing price filter state and logic
 * Follows the same pattern as DA and Traffic filters
 */
export function usePriceFilter(
  entries: PriceSite[],
  fields: any[],
  onFilterChange?: (filteredEntries: PriceSite[]) => void
): UsePriceFilterReturn {
  
  // Initial state
  const [state, setState] = useState<PriceFilterState>({
    selectedIntervals: [],
    customRange: null,
    isOpen: false,
    intervalCounts: {}
  });

  // Temporary state for custom range input
  const [tempCustomRange, setTempCustomRange] = useState<CustomRange>({ min: null, max: null });

  // Get predefined intervals
  const intervals: PriceRangeItem[] = useMemo(() => {
    return PriceFilterService.getPriceIntervals();
  }, []);

  // Count sites in each interval
  const intervalCounts: Record<string, number> = useMemo(() => {
    return PriceFilterService.countSitesInIntervals(entries, fields);
  }, [entries, fields]);

  // Update state with new counts
  useMemo(() => {
    setState(prev => ({
      ...prev,
      intervalCounts
    }));
  }, [intervalCounts]);

  // Check if filter is active
  const isActive = useMemo(() => {
    return state.selectedIntervals.length > 0 || state.customRange !== null;
  }, [state.selectedIntervals, state.customRange]);

  // Check if has selected items
  const hasSelectedItems = useMemo(() => {
    return state.selectedIntervals.length > 0;
  }, [state.selectedIntervals]);

 

  // Get current filter criteria
  const getCurrentCriteria = useCallback((): PriceFilterCriteria => {
    return {
      selectedIntervals: state.selectedIntervals,
      customRange: state.customRange
    };
  }, [state.selectedIntervals, state.customRange]);

  // Toggle interval selection
  const toggleInterval = useCallback((intervalId: string) => {
    setState(prev => {
      const isCurrentlySelected = prev.selectedIntervals.includes(intervalId);
      let newSelectedIntervals: string[];

      if (isCurrentlySelected) {
        // Remove interval from selection
        newSelectedIntervals = prev.selectedIntervals.filter(id => id !== intervalId);
      } else {
        // Add interval to selection
        newSelectedIntervals = [...prev.selectedIntervals, intervalId];
      }

      const newState = {
        ...prev,
        selectedIntervals: newSelectedIntervals
      };

      // Apply filter with new criteria
      const criteria: PriceFilterCriteria = {
        selectedIntervals: newSelectedIntervals,
        customRange: prev.customRange
      };
      
      const filteredEntries = PriceFilterService.filterSites(entries, criteria, fields);
      onFilterChange?.(filteredEntries);

      return newState;
    });
  }, [entries, fields, onFilterChange]);

  // Set custom range (for temporary input)
  const setCustomRange = useCallback((range: CustomRange) => {
    setTempCustomRange(range);
  }, []);

  // Apply custom range (commit the temporary range)
  const applyCustomRange = useCallback(() => {
    // Validate range
    const validation = PriceFilterService.validatePriceRange(tempCustomRange.min, tempCustomRange.max);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setState(prev => {
      const customRange = (tempCustomRange.min !== null || tempCustomRange.max !== null) 
        ? tempCustomRange 
        : null;
      
      const newState = {
        ...prev,
        customRange
      };

      // Apply filter with new criteria
      const criteria: PriceFilterCriteria = {
        selectedIntervals: prev.selectedIntervals,
        customRange
      };
      
      const filteredEntries = PriceFilterService.filterSites(entries, criteria, fields);
      onFilterChange?.(filteredEntries);

      return newState;
    });
  }, [tempCustomRange, entries, fields, onFilterChange]);

  // Clear all filters
  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIntervals: [],
      customRange: null
    }));

    setTempCustomRange({ min: null, max: null });

    // Return all entries when no filter is applied
    onFilterChange?.(entries);
  }, [entries, onFilterChange]);

  // Set dropdown open state
  const setIsOpen = useCallback((open: boolean) => {
    setState(prev => ({
      ...prev,
      isOpen: open
    }));
  }, []);

  // Get filter function for external use
  const getFilterFunction = useCallback(() => {
    if (!isActive) return null;

    const criteria = getCurrentCriteria();
    return (entry: any) => {
      return PriceFilterService.filterSites([entry], criteria, fields).length > 0;
    };
  }, [isActive, getCurrentCriteria, fields]);

  // Get active filters count
  const getActiveFiltersCount = useCallback((): number => {
    return state.selectedIntervals.length + (state.customRange ? 1 : 0);
  }, [state.selectedIntervals, state.customRange]);

  // Get active filters text for button
  const getActiveFiltersText = useCallback((): string => {
    if (!isActive) {
      return 'Preço';
    }

    const totalSelected = getActiveFiltersCount();
    
    if (totalSelected === 1 && state.selectedIntervals.length === 1) {
      const interval = intervals.find(i => i.id === state.selectedIntervals[0]);
      return interval ? interval.label : 'Preço';
    }

    return `Preço (${totalSelected})`;
  }, [isActive, getActiveFiltersCount, state.selectedIntervals, intervals]);

  return {
    // State
    state,
    tempCustomRange,
    isOpen: state.isOpen,
    hasSelectedItems,

    // Actions
    toggleInterval,
    setCustomRange,
    applyCustomRange,
    clearAll,
    setIsOpen,

    // Computed values
    isActive,
    getFilterFunction,
    getActiveFiltersCount,
    getActiveFiltersText
  };
}
