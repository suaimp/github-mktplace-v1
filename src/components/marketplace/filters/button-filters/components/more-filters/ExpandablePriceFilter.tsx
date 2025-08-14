/**
 * Filtro de preço expansível para modal de filtros adicionais
 * Responsabilidade: Renderizar filtro de preço em formato dropdown expansível
 */

import React from 'react';
import { ExpandableFilterItem } from './ExpandableFilterItem';
import { MarketplacePriceDropdown } from '../price/MarketplacePriceDropdown';

interface ExpandablePriceFilterProps {
  entries: any[];
  fields: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
}

export const ExpandablePriceFilter: React.FC<ExpandablePriceFilterProps> = ({
  entries,
  fields,
  onFilterChange
}) => {
  // Adapter para converter entre as interfaces diferentes
  const handlePriceFilterChange = React.useCallback((filteredEntries: any[]) => {
    if (onFilterChange) {
      const filterFn = (entry: any) => {
        return filteredEntries.some(filtered => filtered === entry);
      };
      onFilterChange(filterFn);
    }
  }, [onFilterChange]);

  return (
    <ExpandableFilterItem title="Preço">
      <div className="pt-2">
        <MarketplacePriceDropdown
          entries={entries}
          fields={fields}
          onFilterChange={handlePriceFilterChange}
        />
      </div>
    </ExpandableFilterItem>
  );
};
