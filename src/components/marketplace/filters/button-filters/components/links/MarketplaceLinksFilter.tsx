/**
 * Componente principal de filtro de link
 * Responsabilidade: Combinar botão e dropdown para filtro de tipo de link (Dofollow/Nofollow)
 */

import React from 'react';
import { LinkTypeFilterProps } from '../../types/LinksFilterTypes';
import { useLinksFilter } from '../../hooks/useLinksFilter';
import { MarketplaceLinksButton } from './MarketplaceLinksButton';
import { MarketplaceLinksDropdown } from './MarketplaceLinksDropdown';

interface ExtendedLinkTypeFilterProps extends LinkTypeFilterProps {
  entries?: any[];
  fields?: any[];
}

export const MarketplaceLinksFilter: React.FC<ExtendedLinkTypeFilterProps> = ({
  selectedLinks,
  onLinksChange,
  entries = [],
  fields = []
}) => {
  const {
    searchTerm,
    setSearchTerm,
    isOpen,
    setIsOpen,
    linkOptions
  } = useLinksFilter();

  // Calcular contadores de registros para cada tipo de link
  const entryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Buscar campo que contém "link" no label
    const linkField = fields.find(f => {
      const label = f.label?.toLowerCase() || '';
      return label.includes('link');
    });
    
    if (linkField) {
      linkOptions.forEach(option => {
        counts[option.value] = entries.filter(entry => {
          const linkValue = entry.values?.[linkField.id];
          return String(linkValue).trim() === option.value;
        }).length;
      });
    }
    
    return counts;
  }, [entries, fields, linkOptions]);

  const handleLinksToggle = (typeId: string) => {
    const newSelection = selectedLinks.includes(typeId)
      ? selectedLinks.filter(id => id !== typeId)
      : [...selectedLinks, typeId];
    
    onLinksChange(newSelection);
  };

  const handleClearFilters = () => {
    onLinksChange([]);
  };

  return (
    <div className="relative">
      <MarketplaceLinksButton
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        selectedLinks={selectedLinks}
      />
      
      <MarketplaceLinksDropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        linkOptions={linkOptions}
        selectedLinks={selectedLinks}
        onLinksToggle={handleLinksToggle}
        onClearFilters={handleClearFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        entryCounts={entryCounts}
      />
    </div>
  );
};
