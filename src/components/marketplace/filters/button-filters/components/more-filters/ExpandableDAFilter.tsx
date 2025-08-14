/**
 * Filtro de Domain Authority expansível para modal de filtros adicionais
 * Responsabilidade: Renderizar filtro de DA em formato dropdown expansível
 */

import React from 'react';
import { ExpandableFilterItem } from './ExpandableFilterItem';
import { MarketplaceDADropdown } from '../da/MarketplaceDADropdown';

interface ExpandableDAFilterProps {
  entries: any[];
  fields: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
}

export const ExpandableDAFilter: React.FC<ExpandableDAFilterProps> = ({
  entries,
  fields,
  onFilterChange
}) => {
  return (
    <ExpandableFilterItem title="Domain Authority">
      <div className="pt-2">
        <MarketplaceDADropdown
          entries={entries.length}
          fields={fields}
          onFilterChange={onFilterChange || (() => {})}
        />
      </div>
    </ExpandableFilterItem>
  );
};
