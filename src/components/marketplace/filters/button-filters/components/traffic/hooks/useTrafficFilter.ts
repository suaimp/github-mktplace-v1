import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  TrafficFilterState, 
  UseTrafficFilterReturn
} from '../types/TrafficFilterTypes.js';
import { TrafficFilterService } from '../services/TrafficFilterService.js';
import { CustomRange } from '../../base/types/RangeFilterTypes';

/**
 * Hook para gerenciar estado e lógica do filtro de tráfego
 * Segue o padrão estabelecido pelos outros filtros
 */
export function useTrafficFilter(entries: any[] = [], fields: any[] = []): UseTrafficFilterReturn {
  // Estado inicial do filtro
  const [state, setState] = useState<TrafficFilterState>({
    selectedIntervals: [],
    customRange: null,
    isOpen: false,
    intervalCounts: {} // Será sobrescrito pelo useMemo
  });

  // Estado temporário para custom range (padrão do DA filter)
  const [tempCustomRange, setTempCustomRange] = useState<CustomRange>({ min: null, max: null });
  const [isOpen, setIsOpen] = useState(false);

  // Calcula contagens dos intervalos quando as entradas mudam
  const intervalCounts = useMemo(() => {
    if (!entries.length) return {};
    return TrafficFilterService.countSitesInIntervals(entries, fields);
  }, [entries, fields]);

  // Sincronizar tempCustomRange com state.customRange quando abrir dropdown
  useEffect(() => {
    if (isOpen) {
      const currentRange = state.customRange || { min: null, max: null };
      const tempRange = tempCustomRange;
      
      // Only update if different to prevent loops
      if (JSON.stringify(currentRange) !== JSON.stringify(tempRange)) {
        setTempCustomRange(currentRange);
      }
    }
  }, [isOpen]);

  // Remove o useEffect que atualiza intervalCounts no estado para evitar loop
  // intervalCounts será usado diretamente do useMemo

  /**
   * Toggle de seleção de intervalo
   */
  const toggleInterval = useCallback((intervalId: string) => {
    setState(prev => ({
      ...prev,
      selectedIntervals: prev.selectedIntervals.includes(intervalId)
        ? prev.selectedIntervals.filter(id => id !== intervalId)
        : [...prev.selectedIntervals, intervalId]
    }));
  }, []);

  /**
   * Define range customizado temporário
   */
  const setCustomRange = useCallback((range: CustomRange) => {
    setTempCustomRange(range);
  }, []);

  /**
   * Aplica o range customizado temporário ao estado
   */
  const applyCustomRange = useCallback(() => {
    setState(prev => ({ ...prev, customRange: tempCustomRange }));
    setIsOpen(false);
  }, [tempCustomRange]);

  /**
   * Limpa todos os filtros
   */
  const clearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIntervals: [],
      customRange: null
    }));
    setTempCustomRange({ min: null, max: null });
  }, []);

  /**
   * Verifica se o filtro está ativo
   */
  const isActive = useMemo(() => {
    return state.selectedIntervals.length > 0 || state.customRange !== null;
  }, [state.selectedIntervals, state.customRange]);

  /**
   * Verifica se há itens selecionados
   */
  const hasSelectedItems = useMemo(() => {
    return state.selectedIntervals.length > 0 || state.customRange !== null;
  }, [state.selectedIntervals, state.customRange]);

  /**
   * Retorna função de filtro para aplicar nas entradas
   */
  const getFilterFunction = useCallback(() => {
    if (!isActive) return null;

    console.log('[TrafficFilter] Creating filter function with active filters:', {
      selectedIntervals: state.selectedIntervals,
      customRange: state.customRange
    });

    return (entry: any) => {
      // Se não há filtros ativos, mostrar tudo
      if (state.selectedIntervals.length === 0 && !state.customRange) {
        return true;
      }

      // Obter o maior valor de tráfego do site
      const highestTraffic = TrafficFilterService.getHighestTrafficValue(entry, fields);
      
      // Debug ocasional
      if (Math.random() < 0.1) {
        console.log('[TrafficFilter] Testing entry:', {
          entryId: entry.id,
          highestTraffic,
          selectedIntervals: state.selectedIntervals,
          customRange: state.customRange,
          rawValues: {
            ahrefs: entry.values?.ahrefs_traffic,
            similarweb: entry.values?.similarweb_traffic,
            google: entry.values?.google_traffic
          }
        });
      }

      // Se não tem dados de tráfego, mostrar (para não perder sites)
      if (highestTraffic === 0) {
        return true;
      }

      // Verificar intervalos selecionados
      if (state.selectedIntervals.length > 0) {
        const intervals = TrafficFilterService.getTrafficIntervals();
        const matchesInterval = state.selectedIntervals.some(intervalId => {
          const interval = intervals.find(i => i.id === intervalId);
          if (!interval) return false;
          
          if (interval.max === null) {
            return highestTraffic >= interval.min;
          }
          return highestTraffic >= interval.min && highestTraffic <= interval.max;
        });

        if (matchesInterval) {
          return true;
        }
      }

      // Verificar range customizado
      if (state.customRange) {
        const { min, max } = state.customRange;
        const meetsMin = min === null || highestTraffic >= min;
        const meetsMax = max === null || highestTraffic <= max;
        if (meetsMin && meetsMax) {
          return true;
        }
      }

      // Se chegou até aqui e há filtros ativos, não passa
      return false;
    };
  }, [isActive, state.selectedIntervals, state.customRange]);

  /**
   * Conta filtros ativos
   */
  const getActiveFiltersCount = useCallback(() => {
    let count = state.selectedIntervals.length;
    if (state.customRange) count++;
    return count;
  }, [state.selectedIntervals, state.customRange]);

  /**
   * Texto descritivo dos filtros ativos
   */
  const getActiveFiltersText = useCallback(() => {
    const parts: string[] = [];

    if (state.selectedIntervals.length > 0) {
      const intervals = TrafficFilterService.getTrafficIntervals()
        .filter(interval => state.selectedIntervals.includes(interval.id))
        .map(interval => interval.label);
      
      if (intervals.length === 1) {
        parts.push(`Tráfego: ${intervals[0]}`);
      } else if (intervals.length === 2) {
        parts.push(`Tráfego: ${intervals.join(' e ')}`);
      } else {
        parts.push(`Tráfego: ${intervals.length} intervalos`);
      }
    }

    if (state.customRange) {
      const { min, max } = state.customRange;
      if (min !== null && max !== null) {
        parts.push(`Tráfego: ${TrafficFilterService.formatTrafficValue(min)} - ${TrafficFilterService.formatTrafficValue(max)}`);
      } else if (min !== null) {
        parts.push(`Tráfego: ${TrafficFilterService.formatTrafficValue(min)}+`);
      } else if (max !== null) {
        parts.push(`Tráfego: até ${TrafficFilterService.formatTrafficValue(max)}`);
      }
    }

    return parts.join(', ');
  }, [state.selectedIntervals, state.customRange]);

  return {
    state: {
      ...state,
      intervalCounts,
      isOpen
    },
    tempCustomRange,
    isOpen,
    hasSelectedItems,
    toggleInterval,
    setCustomRange,
    applyCustomRange,
    clearAll,
    setIsOpen,
    isActive,
    getFilterFunction,
    getActiveFiltersCount,
    getActiveFiltersText
  };
}
