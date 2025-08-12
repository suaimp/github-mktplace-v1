import React, { useEffect } from 'react';
import { MarketplaceFilterProps } from '../types';
import { useMarketplaceFilters } from '../hooks/useMarketplaceFilters';
import { MarketplaceFilterButton } from './MarketplaceFilterButton';
import { MarketplaceFilterDropdown } from './MarketplaceFilterDropdown';

export const MarketplaceFilter: React.FC<MarketplaceFilterProps> = ({
  onFiltersChange,
  selectedFilters,
  filterGroups
}) => {
  const {
    selectedFilters: internalFilters,
    isOpen,
    setIsOpen,
    searchTerm,
    setSearchTerm,
    handleFilterChange,
    getSelectedCount,
    filterOptionsBySearch
  } = useMarketplaceFilters(selectedFilters);

  // Sync internal filters with external prop
  useEffect(() => {
    onFiltersChange(internalFilters);
  }, [internalFilters, onFiltersChange]);

  const filteredGroups = filterOptionsBySearch(filterGroups);
  const selectedCount = getSelectedCount();

  return (
    <div className="relative">
      <MarketplaceFilterButton
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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
};
