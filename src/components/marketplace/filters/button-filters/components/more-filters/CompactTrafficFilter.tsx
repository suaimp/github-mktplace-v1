/**
 * Versão compacta do filtro de tráfego para dropdown
 * Responsabilidade: Renderizar conteúdo do filtro de tráfego sem o botão
 */

import React from 'react';
import { useTrafficFilter } from '../traffic/hooks/useTrafficFilter';
import { TrafficFilterService } from '../traffic/services/TrafficFilterService';

interface CompactTrafficFilterProps {
  entries: any[];
  fields: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
}

/**
 * Componente customizado para item de filtro de tráfego
 */
interface TrafficFilterItemProps {
  interval: any;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
}

const TrafficFilterItem: React.FC<TrafficFilterItemProps> = ({
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

export const CompactTrafficFilter: React.FC<CompactTrafficFilterProps> = ({
  entries,
  fields,
  onFilterChange
}) => {
  const trafficFilter = useTrafficFilter(entries, fields);
  
  // Estabilizar função de callback para evitar loops
  const stableOnFilterChange = React.useCallback(onFilterChange || (() => {}), []);
  
  // Aplicar filtro quando houver mudanças
  React.useEffect(() => {
    const filterFn = (entry: any) => {
      const criteria = {
        selectedIntervals: trafficFilter.state.selectedIntervals,
        customRange: trafficFilter.state.customRange
      };
      const filteredEntries = TrafficFilterService.filterSites([entry], criteria);
      return filteredEntries.length > 0;
    };
    stableOnFilterChange(filterFn);
  }, [
    JSON.stringify(trafficFilter.state.selectedIntervals), 
    JSON.stringify(trafficFilter.state.customRange), 
    stableOnFilterChange
  ]);

  const intervals = TrafficFilterService.getTrafficIntervals();

  return (
    <div className="space-y-3">
      {/* Lista de intervalos */}
      <div className="space-y-1">
        {intervals.map((interval) => {
          const count = trafficFilter.state.intervalCounts[interval.id] || 0;
          const isSelected = trafficFilter.state.selectedIntervals.includes(interval.id);

          return (
            <TrafficFilterItem
              key={interval.id}
              interval={interval}
              count={count}
              isSelected={isSelected}
              onSelect={() => trafficFilter.toggleInterval(interval.id)}
            />
          );
        })}
      </div>

      {/* Intervalo personalizado */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Intervalo personalizado
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="De"
            value={trafficFilter.tempCustomRange.min || ''}
            onChange={(e) => trafficFilter.setCustomRange({ 
              min: Number(e.target.value) || null, 
              max: trafficFilter.tempCustomRange.max 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Até"
            value={trafficFilter.tempCustomRange.max || ''}
            onChange={(e) => trafficFilter.setCustomRange({ 
              min: trafficFilter.tempCustomRange.min, 
              max: Number(e.target.value) || null 
            })}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={trafficFilter.applyCustomRange}
          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Aplicar
        </button>
      </div>

      {/* Botão limpar filtros */}
      {trafficFilter.hasSelectedItems && (
        <button
          onClick={trafficFilter.clearAll}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
};
