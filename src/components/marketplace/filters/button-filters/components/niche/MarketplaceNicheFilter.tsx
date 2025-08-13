/**
 * Componente principal de filtro de nicho no marketplace
 * Responsabilidade: Coordenar botão e dropdown de filtros de nicho
 */

import React, { useEffect } from 'react';
import { MarketplaceNicheButton as MarketplaceNicheButtonSimple } from './MarketplaceNicheButtonSimple';
import { MarketplaceNicheDropdown } from './MarketplaceNicheDropdown.tsx';
import { useNicheFilter } from './hooks/useNicheFilter';

interface MarketplaceNicheFilterProps {
  selectedNiches: string[];
  onNichesChange: (niches: string[]) => void;
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
  entries?: any[];
  fields?: any[];
}

export const MarketplaceNicheFilter: React.FC<MarketplaceNicheFilterProps> = ({
  selectedNiches,
  onNichesChange,
  onFilterChange,
  entries = [],
  fields = []
}) => {
  const nicheFilter = useNicheFilter(entries, fields);

  // Calcular contadores de registros para cada nicho
  const entryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    nicheFilter.filteredNiches.forEach(niche => {
      counts[niche.text] = niche.count;
    });
    
    return counts;
  }, [nicheFilter.filteredNiches]);

  // Sync internal state with external state
  useEffect(() => {
    // Create a simple comparison to avoid unnecessary updates
    const currentNiches = [...nicheFilter.state.selectedNiches].sort();
    const externalNiches = [...selectedNiches].sort();
    
    // Only update if they're actually different
    if (JSON.stringify(currentNiches) !== JSON.stringify(externalNiches)) {
      // First clear all selections
      nicheFilter.clearFilters();
      // Then add the external selections
      selectedNiches.forEach(niche => {
        nicheFilter.toggleNiche(niche);
      });
    }
  }, [selectedNiches.join(',')]); // Use join to create stable dependency

  // Update parent when internal selection changes
  useEffect(() => {
    const currentNiches = [...nicheFilter.state.selectedNiches].sort();
    const externalNiches = [...selectedNiches].sort();
    
    // Only notify parent if values are different
    if (JSON.stringify(currentNiches) !== JSON.stringify(externalNiches)) {
      onNichesChange(nicheFilter.state.selectedNiches);
    }
  }, [nicheFilter.state.selectedNiches.join(',')]);

  // Update filter function when selection changes
  useEffect(() => {
    if (onFilterChange) {
      const filterFunction = nicheFilter.getFilterFunction();
      if (filterFunction) {
        onFilterChange(filterFunction);
      } else {
        // When no niches are selected, pass a function that returns all entries
        onFilterChange(() => true);
      }
    }
  }, [nicheFilter.state.selectedNiches.join(',')]);

  return (
    <div className="relative">
      <MarketplaceNicheButtonSimple
        selectedCount={nicheFilter.selectedCount}
        onClick={() => nicheFilter.setIsOpen(!nicheFilter.isOpen)}
        isOpen={nicheFilter.isOpen}
      />
      
      <MarketplaceNicheDropdown 
        isOpen={nicheFilter.isOpen}
        onOpenChange={nicheFilter.setIsOpen}
        niches={nicheFilter.filteredNiches}
        selectedNiches={nicheFilter.state.selectedNiches}
        onNicheToggle={nicheFilter.toggleNiche}
        onClearFilters={nicheFilter.clearFilters}
        searchTerm={nicheFilter.searchTerm}
        onSearchChange={nicheFilter.setSearchTerm}
        entryCounts={entryCounts}
      />
    </div>
  );
};
