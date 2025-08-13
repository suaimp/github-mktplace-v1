/**
 * Marketplace Niche Filter Button
 * Responsability: Display and manage niche filter button with dropdown
 */

import React from 'react';
import { BaseFilterButton } from '../base/BaseFilterButton';
import { MarketplaceNicheDropdown } from './MarketplaceNicheDropdown.tsx';
import { useNicheFilter } from './hooks/useNicheFilter';
import { NicheSite } from './types/NicheFilterTypes';

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
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        }
        ariaLabel="Filtrar por nicho"
      />
      
      {nicheFilter.isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <MarketplaceNicheDropdown 
            niches={nicheFilter.filteredNiches}
            searchTerm={nicheFilter.searchTerm}
            onSearchChange={nicheFilter.setSearchTerm}
            onNicheToggle={nicheFilter.toggleNiche}
            onClear={nicheFilter.clearFilters}
            isVisible={nicheFilter.isOpen}
            onClose={() => nicheFilter.setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
