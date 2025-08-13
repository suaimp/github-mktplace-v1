import React from 'react';
import { BaseFilterButton, BaseRangeFilterDropdown } from '../base';
import { useTrafficFilter } from './hooks/useTrafficFilter';
import { TrafficFilterService } from './services/TrafficFilterService';
import { TrafficRangeItem } from './types/TrafficFilterTypes';
import { PlusCircleIcon } from '../../../../../../icons';

interface MarketplaceTrafficDropdownProps {
  entries: any[];
  fields?: any[];
  onFilterChange?: (filterFn: (entry: any) => boolean) => void;
  disabled?: boolean;
}

/**
 * Componente customizado para item de filtro de tráfego
 * Sem ícones e com contagem de sites na segunda coluna
 */
interface TrafficFilterItemProps {
  interval: TrafficRangeItem;
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
  const handleClick = () => {
    onSelect();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
    >
      {/* Checkbox */}
      <div className="flex items-center">
        <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Content sem ícone */}
      <div className="flex-1 flex items-center justify-between">
        {/* Label do intervalo */}
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {interval.label}
        </span>

        {/* Contagem de sites */}
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {count} sites
        </span>
      </div>
    </div>
  );
};

/**
 * Componente dropdown para filtro de tráfego no marketplace
 * Usa BaseFilterButton + BaseRangeFilterDropdown como o DA filter
 */
export function MarketplaceTrafficDropdown({ 
  entries, 
  fields = [],
  onFilterChange,
  disabled = false 
}: MarketplaceTrafficDropdownProps) {
  const {
    state,
    tempCustomRange,
    isOpen,
    hasSelectedItems,
    toggleInterval,
    setCustomRange,
    applyCustomRange,
    clearAll,
    setIsOpen,
    getFilterFunction
  } = useTrafficFilter(entries, fields);
  
  // Memoizar intervalos para evitar re-criações desnecessárias
  const intervals = React.useMemo(() => {
    return TrafficFilterService.getTrafficIntervals();
  }, []);

  // Detecta qual campo de tráfego usar
  const trafficField = React.useMemo(() => {
    console.log('[TrafficDropdown] Detecting traffic field from fields:', {
      fieldsCount: fields.length,
      fieldsTypes: fields.map(f => ({ id: f.id, field_type: f.field_type, label: f.label })),
      trafficRelatedFields: fields.filter(f => 
        f.field_type?.includes('traffic') || 
        f.label?.toLowerCase()?.includes('traffic') ||
        f.label?.toLowerCase()?.includes('tráfego')
      )
    });
    
    const detected = TrafficFilterService.detectTrafficField(fields);
    console.log('[TrafficDropdown] Detected traffic field:', detected);
    
    return detected;
  }, [fields]);

  // Estabilizar callback usando ref para evitar loops
  const onFilterChangeRef = React.useRef(onFilterChange);
  React.useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Efeito para notificar mudanças no filtro
  React.useEffect(() => {
    if (onFilterChangeRef.current) {
      console.log('[Traffic Filter] Creating filter function. hasSelectedItems:', hasSelectedItems, 'trafficField:', trafficField?.id);
      const filterFn = getFilterFunction();
      // Se não há filtro ativo, passa uma função que retorna true para todos
      const finalFilterFn = filterFn || (() => true);
      onFilterChangeRef.current(finalFilterFn);
    }
  }, [getFilterFunction, hasSelectedItems, trafficField]);

  // Calcular count dos filtros selecionados
  const selectedCount = state.selectedIntervals.length + (state.customRange ? 1 : 0);

  // Texto do botão
  const getButtonText = () => {
    if (selectedCount === 0) return 'Tráfego';
    if (selectedCount === 1) {
      return 'Tráfego';
    }
    return `Tráfego: ${selectedCount} filtros`;
  };

  return (
    <div className="relative">
      <BaseFilterButton
        selectedCount={selectedCount}
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        label={getButtonText()}
        icon={<PlusCircleIcon />}
        ariaLabel={`Filtrar por tráfego${entries.length > 0 ? ` (${entries.length} registros)` : ''}`}
      />

      <BaseRangeFilterDropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        customRangeTitle="Intervalo personalizado"
        applyButtonText="Aplicar"
        customRange={tempCustomRange}
        onCustomRangeChange={setCustomRange}
        onApplyCustomRange={applyCustomRange}
        hasSelectedItems={hasSelectedItems}
        onClearFilters={clearAll}
      >
        {/* Lista de intervalos */}
        <div className="space-y-1">
          {intervals.map((interval) => {
            const count = state.intervalCounts[interval.id] || 0;
            const isSelected = state.selectedIntervals.includes(interval.id);

            return (
              <TrafficFilterItem
                key={interval.id}
                interval={interval}
                count={count}
                isSelected={isSelected}
                onSelect={() => !disabled && toggleInterval(interval.id)}
              />
            );
          })}
        </div>
      </BaseRangeFilterDropdown>
    </div>
  );
}
