import React from 'react';
import { BaseRangeFilterDropdown } from '../base/BaseRangeFilterDropdown';
import { BaseRangeFilterItem } from '../base/BaseRangeFilterItem';
import { usePriceFilter } from './hooks/usePriceFilter';
import { PriceFilterService } from './services/PriceFilterService';
import { PriceSite } from './types/PriceFilterTypes';

interface MarketplacePriceDropdownProps {
  entries: PriceSite[];
  fields: any[];
  onFilterChange?: (filteredEntries: PriceSite[]) => void;
}

/**
 * Price range filter dropdown component
 * Uses BaseRangeFilterDropdown with price-specific logic
 */
export function MarketplacePriceDropdown({ 
  entries, 
  fields, 
  onFilterChange 
}: MarketplacePriceDropdownProps) {
  
  const priceFilter = usePriceFilter(entries, fields, onFilterChange);

  // Get price intervals mapped to RangeOption format
  const priceOptions = React.useMemo(() => {
    return PriceFilterService.getPriceIntervals().map(interval => ({
      id: interval.id,
      label: interval.label,
      minValue: interval.min,
      maxValue: interval.max || 999999999, // Use large number for unlimited max
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
      description: `${priceFilter.state.intervalCounts[interval.id] || 0} sites`
    }));
  }, [priceFilter.state.intervalCounts]);

  return (
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
      {priceOptions.map((option) => (
        <BaseRangeFilterItem
          key={option.id}
          option={option}
          isSelected={priceFilter.state.selectedIntervals.includes(option.id)}
          onSelect={priceFilter.toggleInterval}
          showInfo={true}
        />
      ))}
    </BaseRangeFilterDropdown>
  );
}
