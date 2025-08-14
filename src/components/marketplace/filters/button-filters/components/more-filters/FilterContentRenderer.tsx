/**
 * Renderizador de conteúdo de filtro sem botão
 * Responsabilidade: Renderizar apenas o conteúdo interno de um filtro, sem o botão wrapper
 */

import React, { useState } from 'react';

interface FilterContentRendererProps {
  children: (isOpen: boolean, setIsOpen: (open: boolean) => void) => React.ReactNode;
}

export const FilterContentRenderer: React.FC<FilterContentRendererProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true); // Sempre aberto no modal

  return (
    <div className="w-full">
      {children(isOpen, setIsOpen)}
    </div>
  );
};
