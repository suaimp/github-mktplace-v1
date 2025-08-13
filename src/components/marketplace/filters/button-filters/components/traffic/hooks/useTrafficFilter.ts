import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  TrafficFilterState, 
  UseTrafficFilterReturn, 
  TrafficFilterCriteria 
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
    intervalCounts: {}
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
      setTempCustomRange(state.customRange || { min: null, max: null });
    }
  }, [isOpen, state.customRange]);

  // Atualiza as contagens no estado quando necessário
  useEffect(() => {
    setState(prev => ({ ...prev, intervalCounts }));
  }, [intervalCounts]);

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

    const criteria: TrafficFilterCriteria = {
      selectedIntervals: state.selectedIntervals,
      customRange: state.customRange
    };

    return (entry: any) => {
      // Aplica filtro usando TrafficFilterService
      const filteredEntries = TrafficFilterService.filterSites([entry], criteria);
      return filteredEntries.length > 0;
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
