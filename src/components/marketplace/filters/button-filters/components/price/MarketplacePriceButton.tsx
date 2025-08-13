import React from 'react';
import { BaseFilterButton } from '../base/BaseFilterButton';
import { BaseRangeFilterDropdown } from '../base/BaseRangeFilterDropdown';
import { usePriceFilter } from './hooks/usePriceFilter';
import { PriceFilterService } from './services/PriceFilterService';
import { PriceRangeItem } from './types/PriceFilterTypes';
import { PriceSite } from './types/PriceFilterTypes';
import { PlusCircleIcon } from '../../../../../../icons';

interface MarketplacePriceButtonProps {
  entries: PriceSite[];
  fields: any[];
  onFilterChange?: (filteredEntries: PriceSite[]) => void;
}

/**
 * Componente customizado para item de filtro de preço
 * Sem ícones e com contagem de sites na segunda coluna (igual ao Tráfego)
 */
interface PriceFilterItemProps {
  interval: PriceRangeItem;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
}

const PriceFilterItem: React.FC<PriceFilterItemProps> = ({
  interval,
  count,
  isSelected,
  onSelect
}) => {
  const handleClick = () => {
    onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
    >
      {/* Checkbox */}
      <div className="flex items-center">
        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Content sem ícone */}
      <div className="flex-1 flex items-center justify-between">
        {/* Label do intervalo */}
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {interval.label}
        </span>

        {/* Contagem de sites */}
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {count} sites
        </span>
      </div>
    </div>
  );
};

interface MarketplacePriceButtonProps {
  entries: PriceSite[];
  fields: any[];
  onFilterChange?: (filteredEntries: PriceSite[]) => void;
}

/**
 * Price filter button component
 * Combines BaseFilterButton with dropdown using single hook instance
 */
export function MarketplacePriceButton({ 
  entries, 
  fields, 
  onFilterChange 
}: MarketplacePriceButtonProps) {
  
  const priceFilter = usePriceFilter(entries, fields, onFilterChange);

  // Get price intervals
  const priceIntervals = React.useMemo(() => {
    return PriceFilterService.getPriceIntervals();
  }, []);

  return (
    <div className="relative">
      <BaseFilterButton
        selectedCount={priceFilter.getActiveFiltersCount()}
        onClick={() => priceFilter.setIsOpen(!priceFilter.isOpen)}
        isOpen={priceFilter.isOpen}
        label="Preço"
        icon={<PlusCircleIcon />}
        ariaLabel="Filtrar por preço"
      />
      
      {priceFilter.isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <BaseRangeFilterDropdown
            isOpen={priceFilter.isOpen}
            onOpenChange={priceFilter.setIsOpen}
            customRangeTitle="Intervalo de preço personalizado"
            applyButtonText="Aplicar filtro"
            customRange={priceFilter.tempCustomRange}
            onCustomRangeChange={priceFilter.setCustomRange}
            onApplyCustomRange={priceFilter.applyCustomRange}
            hasSelectedItems={priceFilter.hasSelectedItems}
            onClearFilters={priceFilter.clearAll}
          >
            {priceIntervals.map((interval) => (
              <PriceFilterItem
                key={interval.id}
                interval={interval}
                count={priceFilter.state.intervalCounts[interval.id] || 0}
                isSelected={priceFilter.state.selectedIntervals.includes(interval.id)}
                onSelect={() => priceFilter.toggleInterval(interval.id)}
              />
            ))}
          </BaseRangeFilterDropdown>
        </div>
      )}
    </div>
  );
}
