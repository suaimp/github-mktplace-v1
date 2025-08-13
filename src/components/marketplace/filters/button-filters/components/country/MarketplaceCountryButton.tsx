/**
 * Componente de botão para filtros de país no marketplace
 * Responsabilidade: Renderizar botão de filtro de país
 */

import React from 'react';
import { CountryButtonProps } from '../../types';
import { PlusCircleIcon } from '../../../../../../icons';
import { BaseFilterButton } from '../base';

export const MarketplaceCountryButton: React.FC<CountryButtonProps> = ({
  selectedCount,
  onClick,
  isOpen
}) => {
  return (
    <BaseFilterButton
      selectedCount={selectedCount}
      onClick={onClick}
      isOpen={isOpen}
      label="País"
      icon={<PlusCircleIcon className="mr-2 h-4 w-4" />}
      ariaLabel={`Filtrar por país${selectedCount > 0 ? ` (${selectedCount} selecionados)` : ''}`}
    />
  );
};
