/**
 * Versão compacta do filtro de links para dropdown
 * Responsabilidade: Renderizar conteúdo do filtro de links sem o botão
 */

import React from 'react';
import { useLinksFilter } from '../../hooks/useLinksFilter';

interface CompactLinksFilterProps {
  selectedLinks: string[];
  onLinksChange: (links: string[]) => void;
  entries: any[];
  fields: any[];
}

interface LinkItemProps {
  option: any;
  count: number;
  isSelected: boolean;
  onToggle: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ option, count, isSelected, onToggle }) => {
  return (
    <div
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // Controlled by parent click
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-gray-900 dark:text-white">
          {option.label}
        </span>
      </div>
      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {count} sites
      </div>
    </div>
  );
};

export const CompactLinksFilter: React.FC<CompactLinksFilterProps> = ({
  selectedLinks,
  onLinksChange,
  entries,
  fields
}) => {
  const {
    searchTerm,
    setSearchTerm,
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

  // Filtrar opções com base na pesquisa
  const filteredOptions = linkOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Campo de pesquisa */}
      <div>
        <input
          type="text"
          placeholder="Pesquisar tipos de link..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Lista de tipos de link */}
      <div className="space-y-1">
        {filteredOptions.map((option) => (
          <LinkItem
            key={option.value}
            option={option}
            count={entryCounts[option.value] || 0}
            isSelected={selectedLinks.includes(option.value)}
            onToggle={() => handleLinksToggle(option.value)}
          />
        ))}
      </div>

      {/* Botão limpar filtros */}
      {selectedLinks.length > 0 && (
        <button
          onClick={handleClearFilters}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Limpar filtros ({selectedLinks.length} selecionados)
        </button>
      )}
    </div>
  );
};
