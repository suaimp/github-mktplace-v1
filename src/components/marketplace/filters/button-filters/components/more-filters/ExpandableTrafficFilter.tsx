/**
 * Filtro de tráfego expansível para modal de filtros adicionais
 * Responsabilidade: Renderizar filtro de tráfego em formato dropdown expansível
 */

import React from 'react';
import { ExpandableFilterItem } from './ExpandableFilterItem';
import { MarketplaceTrafficDropdown } from '../traffic/MarketplaceTrafficDropdown';

interface ExpandableTrafficFilterProps {
  entries: any[];
  fields: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
}

export const ExpandableTrafficFilter: React.FC<ExpandableTrafficFilterProps> = ({
  entries,
  fields,
  onFilterChange
}) => {
  return (
    <ExpandableFilterItem title="Tráfego">
      <div className="pt-2">
        <MarketplaceTrafficDropdown
          entries={entries}
          fields={fields}
          onFilterChange={onFilterChange}
        />
      </div>
    </ExpandableFilterItem>
  );
};
