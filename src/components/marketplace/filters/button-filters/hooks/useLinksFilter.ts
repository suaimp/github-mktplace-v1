/**
 * Hook para filtros de link (Dofollow/Nofollow)
 * Responsabilidade: Gerenciar estado do filtro de tipo de link
 */

import { useState, useMemo } from 'react';
import { LinksFilterService } from '../services/LinksFilterService';

export const useLinksFilter = () => {
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Gerar opções de filtro
  const linkOptions = useMemo(() => {
    return LinksFilterService.generateLinkTypeFilterOptions();
  }, []);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return linkOptions;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return linkOptions.filter(option =>
      option.label.toLowerCase().includes(lowerSearchTerm)
    );
  }, [linkOptions, searchTerm]);

  // Alternar seleção de um tipo de link
  const toggleLinkType = (typeId: string) => {
    setSelectedLinks(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  // Limpar todos os filtros
  const clearLinksFilters = () => {
    setSelectedLinks([]);
  };

  return {
    selectedLinks,
    setSelectedLinks,
    searchTerm,
    setSearchTerm,
    isOpen,
    setIsOpen,
    linkOptions: filteredOptions,
    toggleLinkType,
    clearLinksFilters,
    hasSelectedLinks: selectedLinks.length > 0
  };
};
