/**
 * Marketplace Niche Filter Button
 * Responsability: Display and manage niche filter button with dropdown
 */

import React from 'react';
import { BaseFilterButton } from '../base/BaseFilterButton';
import { MarketplaceNicheDropdown } from './MarketplaceNicheDropdown.tsx';
import { useNicheFilter } from './hooks/useNicheFilter';
import { NicheSite } from './types/NicheFilterTypes';
import { PlusCircleIcon } from '../../../../../../icons';

interface MarketplaceNicheButtonProps {
  entries: NicheSite[];
  onFilterChange: (filterFn: ((entry: any) => boolean) | null) => void;
}

export function MarketplaceNicheButton({ 
  entries, 
  onFilterChange 
}: MarketplaceNicheButtonProps) {
  
  const nicheFilter = useNicheFilter(entries);

  // Update parent filter when selection changes
  React.useEffect(() => {
    const filterFunction = nicheFilter.getFilterFunction();
    onFilterChange(filterFunction);
  }, [nicheFilter.selectedCount, onFilterChange]);

  return (
    <div className="relative">
      <BaseFilterButton
        selectedCount={nicheFilter.getActiveFiltersCount()}
        onClick={() => nicheFilter.setIsOpen(!nicheFilter.isOpen)}
        isOpen={nicheFilter.isOpen}
        label="Nicho"
        icon={<PlusCircleIcon />}
        ariaLabel="Filtrar por nicho"
      />
      
      {nicheFilter.isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <MarketplaceNicheDropdown 
            isOpen={nicheFilter.isOpen}
            onOpenChange={nicheFilter.setIsOpen}
            niches={nicheFilter.filteredNiches}
            selectedNiches={nicheFilter.state.selectedNiches}
            onNicheToggle={nicheFilter.toggleNiche}
            onClearFilters={nicheFilter.clearFilters}
            searchTerm={nicheFilter.searchTerm}
            onSearchChange={nicheFilter.setSearchTerm}
            entryCounts={nicheFilter.state.allNiches.reduce((acc, niche) => {
              acc[niche.text] = niche.count;
              return acc;
            }, {} as Record<string, number>)}
          />
        </div>
      )}
    </div>
  );
}
