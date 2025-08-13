import { BaseFilterButton } from '../base/BaseFilterButton';
import { MarketplacePriceDropdown } from './MarketplacePriceDropdown';
import { usePriceFilter } from './hooks/usePriceFilter';
import { PriceSite } from './types/PriceFilterTypes';

interface MarketplacePriceFilterProps {
  entries: PriceSite[];
  fields: any[];
  onFilterChange?: (filteredEntries: PriceSite[]) => void;
}

/**
 * Main price filter component
 * Combines BaseFilterButton with MarketplacePriceDropdown
 */
export function MarketplacePriceFilter({ 
  entries, 
  fields, 
  onFilterChange 
}: MarketplacePriceFilterProps) {
  
  const priceFilter = usePriceFilter(entries, fields, onFilterChange);

  const handleButtonClick = () => {
    priceFilter.setIsOpen(!priceFilter.isOpen);
  };

  return (
    <div className="relative">
      <BaseFilterButton
        selectedCount={priceFilter.getActiveFiltersCount()}
        onClick={handleButtonClick}
        isOpen={priceFilter.isOpen}
        label={priceFilter.getActiveFiltersText()}
        icon={
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path 
              d="M12 2L15.09 8.26L22 9L17 14.74L18.18 22L12 18.77L5.82 22L7 14.74L2 9L8.91 8.26L12 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        }
        ariaLabel="Filtrar por preço"
      />
      
      {priceFilter.isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2">
          <MarketplacePriceDropdown
            entries={entries}
            fields={fields}
            onFilterChange={onFilterChange}
          />
        </div>
      )}
    </div>
  );
}
