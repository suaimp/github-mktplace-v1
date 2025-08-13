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
    // Update internal selected niches when prop changes
    selectedNiches.forEach(niche => {
      if (!nicheFilter.state.selectedNiches.includes(niche)) {
        nicheFilter.toggleNiche(niche);
      }
    });
  }, [selectedNiches]);

  // Update parent when internal selection changes
  useEffect(() => {
    onNichesChange(nicheFilter.state.selectedNiches);
  }, [nicheFilter.state.selectedNiches, onNichesChange]);

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
  }, [nicheFilter.state.selectedNiches, onFilterChange]);

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
