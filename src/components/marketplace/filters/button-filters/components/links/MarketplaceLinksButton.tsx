/**
 * Componente do botão de filtro de links
 * Responsabilidade: Renderizar botão que abre filtro de quantidade de links
 */

import React from 'react';
import { BaseFilterButton } from '../base';
import { BoxIcon } from '../../../../../../icons';

interface MarketplaceLinksButtonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLinks: string[];
}

export const MarketplaceLinksButton: React.FC<MarketplaceLinksButtonProps> = ({
  isOpen,
  onOpenChange,
  selectedLinks
}) => {
  return (
    <BaseFilterButton
      isOpen={isOpen}
      onClick={() => onOpenChange(!isOpen)}
      label="Links"
      icon={<BoxIcon />}
      selectedCount={selectedLinks.length}
    />
  );
};
