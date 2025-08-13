/**
 * Componente de dropdown para filtros de link no marketplace
 * Responsabilidade: Renderizar lista de tipos de link (Dofollow/Nofollow) para seleção
 */

import React from 'react';
import { LinkTypeFilterOption } from '../../types/LinksFilterTypes';
import { BaseFilterDropdown, BaseFilterItem } from '../base';

interface MarketplaceLinksDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  linkOptions: LinkTypeFilterOption[];
  selectedLinks: string[];
  onLinksToggle: (typeId: string) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  entryCounts: Record<string, number>;
}

export const MarketplaceLinksDropdown: React.FC<MarketplaceLinksDropdownProps> = ({
  isOpen,
  onOpenChange,
  linkOptions,
  selectedLinks,
  onLinksToggle,
  onClearFilters,
  searchTerm,
  onSearchChange,
  entryCounts
}) => {
  const hasSelectedLinks = selectedLinks.length > 0;

  return (
    <BaseFilterDropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filtrar por Tipo de Link"
      searchPlaceholder="Buscar tipos de link..."
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      hasSelectedItems={hasSelectedLinks}
      onClearFilters={onClearFilters}
      emptyMessage="Nenhum tipo encontrado"
    >
      {linkOptions.length > 0 ? (
        linkOptions.map((option) => (
          <BaseFilterItem
            key={option.id}
            id={option.id}
            label={option.label}
            isSelected={selectedLinks.includes(option.id)}
            onToggle={(id) => onLinksToggle(id)}
            secondaryInfo={entryCounts[option.value] || 0}
          />
        ))
      ) : (
        <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Nenhum tipo encontrado
        </div>
      )}
    </BaseFilterDropdown>
  );
};
