/**
 * Componente de botão para filtros de categoria no marketplace
 * Responsabilidade: Renderizar botão de filtro de categoria
 */

import React from 'react';
import { CategoryButtonProps } from '../../types';
import { PlusCircleIcon } from '../../../../../../icons';
import { BaseFilterButton } from '../base';

export const MarketplaceCategoryButton: React.FC<CategoryButtonProps> = ({
  selectedCount,
  onClick,
  isOpen
}) => {
  return (
    <BaseFilterButton
      selectedCount={selectedCount}
      onClick={onClick}
      isOpen={isOpen}
      label="Categoria"
      icon={<PlusCircleIcon className="mr-2 h-4 w-4" />}
      ariaLabel={`Filtrar por categoria${selectedCount > 0 ? ` (${selectedCount} selecionados)` : ''}`}
    />
  );
};
