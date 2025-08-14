/**
 * Versão compacta do filtro de nicho para dropdown
 * Responsabilidade: Renderizar conteúdo do filtro de nicho sem o botão
 */

import React from 'react';
import { useNicheFilter } from '../niche/hooks/useNicheFilter';

interface CompactNicheFilterProps {
  selectedNiches: string[];
  onNichesChange: (niches: string[]) => void;
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
  entries: any[];
  fields: any[];
}

interface NicheItemProps {
  niche: any;
  isSelected: boolean;
  onToggle: () => void;
}

const NicheItem: React.FC<NicheItemProps> = ({ niche, isSelected, onToggle }) => {
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
          {niche.text}
        </span>
      </div>
      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {niche.count} sites
      </div>
    </div>
  );
};

export const CompactNicheFilter: React.FC<CompactNicheFilterProps> = ({
  selectedNiches,
  onNichesChange,
  onFilterChange,
  entries,
  fields
}) => {
  const nicheFilter = useNicheFilter(entries, fields);

  // Sync internal state with external state
  React.useEffect(() => {
    const currentNiches = [...nicheFilter.state.selectedNiches].sort();
    const externalNiches = [...selectedNiches].sort();
    
    if (JSON.stringify(currentNiches) !== JSON.stringify(externalNiches)) {
      nicheFilter.clearFilters();
      selectedNiches.forEach(niche => {
        nicheFilter.toggleNiche(niche);
      });
    }
  }, [selectedNiches.join(',')]);

  // Update parent when internal selection changes
  React.useEffect(() => {
    const currentNiches = [...nicheFilter.state.selectedNiches].sort();
    const externalNiches = [...selectedNiches].sort();
    
    if (JSON.stringify(currentNiches) !== JSON.stringify(externalNiches)) {
      onNichesChange(nicheFilter.state.selectedNiches);
    }
  }, [nicheFilter.state.selectedNiches.join(',')]);

  // Update filter function when selection changes
  React.useEffect(() => {
    if (onFilterChange) {
      const filterFunction = nicheFilter.getFilterFunction();
      if (filterFunction) {
        onFilterChange(filterFunction);
      } else {
        onFilterChange(() => true);
      }
    }
  }, [nicheFilter.state.selectedNiches.join(',')]);

  return (
    <div className="space-y-3">
      {/* Campo de pesquisa */}
      <div>
        <input
          type="text"
          placeholder="Pesquisar nichos..."
          value={nicheFilter.searchTerm}
          onChange={(e) => nicheFilter.setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Lista de nichos */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {nicheFilter.filteredNiches.map((niche) => (
          <NicheItem
            key={niche.text}
            niche={niche}
            isSelected={nicheFilter.state.selectedNiches.includes(niche.text)}
            onToggle={() => nicheFilter.toggleNiche(niche.text)}
          />
        ))}
      </div>

      {/* Botão limpar filtros */}
      {nicheFilter.selectedCount > 0 && (
        <button
          onClick={nicheFilter.clearFilters}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Limpar filtros ({nicheFilter.selectedCount} selecionados)
        </button>
      )}
    </div>
  );
};
