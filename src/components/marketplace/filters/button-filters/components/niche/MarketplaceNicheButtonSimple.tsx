/**
 * Componente de botão para filtros de nicho no marketplace
 * Responsabilidade: Renderizar botão de filtro de nicho
 */

import React from 'react';
import { BaseFilterButton } from '../base';

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
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      }
      ariaLabel={`Filtrar por nicho${selectedCount > 0 ? ` (${selectedCount} selecionados)` : ''}`}
    />
  );
};
