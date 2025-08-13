/**
 * Componente de botão para filtros de nicho no marketplace
 * Responsabilidade: Renderizar botão de filtro de nicho
 */

import React from 'react';
import { BaseFilterButton } from '../base';
import { PlusCircleIcon } from '../../../../../../icons';

interface NicheButtonProps {
  selectedCount: number;
  onClick: () => void;
  isOpen: boolean;
}

export const MarketplaceNicheButton: React.FC<NicheButtonProps> = ({
  selectedCount,
  onClick,
  isOpen
}) => {
  return (
    <BaseFilterButton
      selectedCount={selectedCount}
      onClick={onClick}
      isOpen={isOpen}
      label="Nicho"
      icon={<PlusCircleIcon />}
      ariaLabel={`Filtrar por nicho${selectedCount > 0 ? ` (${selectedCount} selecionados)` : ''}`}
    />
  );
};
