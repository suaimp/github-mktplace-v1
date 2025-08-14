/**
 * Versão compacta do filtro de preço para dropdown
 * Responsabilidade: Renderizar conteúdo do filtro de preço sem o botão
 */

import React from 'react';
import { usePriceFilter } from '../price/hooks/usePriceFilter';
import { PriceFilterService } from '../price/services/PriceFilterService';

interface CompactPriceFilterProps {
  entries: any[];
  fields: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
}

/**
 * Componente customizado para item de filtro de preço
 */
interface PriceFilterItemProps {
  interval: any;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
}

const PriceFilterItem: React.FC<PriceFilterItemProps> = ({
  interval,
  count,
  isSelected,
  onSelect
}) => {
  return (
    <div
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // Controlled by parent click
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-gray-900 dark:text-white">
          {interval.label}
        </span>
      </div>
      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {count} sites
      </div>
    </div>
  );
};

export const CompactPriceFilter: React.FC<CompactPriceFilterProps> = ({
  entries,
  fields,
  onFilterChange
}) => {
  const priceFilter = usePriceFilter(entries, fields, (filteredEntries) => {
    if (onFilterChange) {
      const filterFn = (entry: any) => {
        return filteredEntries.some(filtered => filtered === entry);
      };
      onFilterChange(filterFn);
    }
  });

  const intervals = PriceFilterService.getPriceIntervals();

  return (
    <div className="space-y-3">
      {/* Lista de intervalos */}
      <div className="space-y-1">
        {intervals.map((interval) => {
          const count = priceFilter.state.intervalCounts[interval.id] || 0;
          const isSelected = priceFilter.state.selectedIntervals.includes(interval.id);

          return (
            <PriceFilterItem
              key={interval.id}
              interval={interval}
              count={count}
              isSelected={isSelected}
              onSelect={() => priceFilter.toggleInterval(interval.id)}
            />
          );
        })}
      </div>

      {/* Intervalo personalizado */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Intervalo de preço personalizado
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="De"
            value={priceFilter.tempCustomRange.min || ''}
            onChange={(e) => priceFilter.setCustomRange({ 
              min: Number(e.target.value) || null, 
              max: priceFilter.tempCustomRange.max 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Até"
            value={priceFilter.tempCustomRange.max || ''}
            onChange={(e) => priceFilter.setCustomRange({ 
              min: priceFilter.tempCustomRange.min, 
              max: Number(e.target.value) || null 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={priceFilter.applyCustomRange}
          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Aplicar filtro
        </button>
      </div>

      {/* Botão limpar filtros */}
      {priceFilter.hasSelectedItems && (
        <button
          onClick={priceFilter.clearAll}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
};
