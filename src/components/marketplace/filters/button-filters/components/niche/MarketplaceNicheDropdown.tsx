/**
 * Componente de dropdown para filtros de nicho no marketplace
 * Responsabilidade: Renderizar lista de nichos para seleção
 */

import React from 'react';
import { NicheFilterItem } from './types/NicheFilterTypes';
import { BaseFilterDropdown, BaseFilterItem } from '../base';

interface MarketplaceNicheDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  niches: NicheFilterItem[];
  selectedNiches: string[];
  onNicheToggle: (nicheText: string) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  entryCounts: Record<string, number>;
}

export const MarketplaceNicheDropdown: React.FC<MarketplaceNicheDropdownProps> = ({
  isOpen,
  onOpenChange,
  niches,
  selectedNiches,
  onNicheToggle,
  onClearFilters,
  searchTerm,
  onSearchChange,
  entryCounts
}) => {
  const hasSelectedNiches = selectedNiches.length > 0;

  const renderNicheIcon = (icon?: string) => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return <span className="text-sm">{icon}</span>;
    }
    
    return icon;
  };

  return (
    <BaseFilterDropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filtrar por Nicho"
      searchPlaceholder="Buscar nichos..."
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      hasSelectedItems={hasSelectedNiches}
      onClearFilters={onClearFilters}
      emptyMessage="Nenhum nicho encontrado"
    >
      {niches.length > 0 ? (
        niches.map((niche) => (
          <BaseFilterItem
            key={niche.text}
            id={niche.text}
            label={niche.text}
            isSelected={selectedNiches.includes(niche.text)}
            onToggle={(id) => onNicheToggle(id)}
            icon={renderNicheIcon(niche.icon)}
            secondaryInfo={entryCounts[niche.text] || niche.count || 0}
          />
        ))
      ) : (
        <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Nenhum nicho encontrado
        </div>
      )}
    </BaseFilterDropdown>
  );
};
