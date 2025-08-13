/**
 * Hook para gerenciar estado do filtro de DA
 * Responsabilidade: Controlar estado e lógica do filtro de Domain Authority
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { RangeFilterState, CustomRange } from '../components/base/types/RangeFilterTypes';
import { DAFilterService } from '../services/DAFilterService';
import { ClassificationColorService } from '../../../services/ClassificationColorService';

export interface UseDAFilterReturn {
  state: RangeFilterState;
  tempCustomRange: CustomRange;
  isOpen: boolean;
  options: ReturnType<typeof DAFilterService.generateDAFilterOptions>;
  hasSelectedItems: boolean;
  toggleRange: (rangeId: string) => void;
  setCustomRange: (range: CustomRange) => void;
  applyCustomRange: () => void;
  clearFilters: () => void;
  setIsOpen: (open: boolean) => void;
  formatSelectedFilters: () => string;
  isDAValueFiltered: (daValue: number) => boolean;
}

export const useDAFilter = (): UseDAFilterReturn => {
  const [state, setState] = useState<RangeFilterState>({
    selectedRanges: [],
    customRange: { min: null, max: null }
  });
  
  const [tempCustomRange, setTempCustomRange] = useState<CustomRange>({ min: null, max: null });
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sincronizar tempCustomRange com state.customRange quando abrir dropdown
  useEffect(() => {
    if (isOpen) {
      setTempCustomRange({ ...state.customRange });
    }
  }, [isOpen, state.customRange]);

  // Detectar mudanças no dark mode
  useEffect(() => {
    const detectDarkMode = () => {
      setIsDarkMode(ClassificationColorService.isDarkMode());
    };

    // Detectar mudanças no tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          detectDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    detectDarkMode(); // Detectar inicialmente

    return () => observer.disconnect();
  }, []);

  // Memoizar opções com cores baseadas no tema atual
  const options = useMemo(() => DAFilterService.generateDAFilterOptions(isDarkMode), [isDarkMode]);

  // Verificar se há itens selecionados
  const hasSelectedItems = useMemo(() => {
    const result = state.selectedRanges.length > 0 || 
           state.customRange.min !== null || 
           state.customRange.max !== null;
    return result;
  }, [state]);

  /**
   * Alternar seleção de um range predefinido
   */
  const toggleRange = useCallback((rangeId: string) => {
    setState(prev => ({
      ...prev,
      selectedRanges: prev.selectedRanges.includes(rangeId)
        ? prev.selectedRanges.filter(id => id !== rangeId)
        : [...prev.selectedRanges, rangeId]
    }));
  }, []);

  /**
   * Atualizar range customizado temporário (apenas para exibição nos inputs)
   */
  const setCustomRange = useCallback((range: CustomRange) => {
    setTempCustomRange(range);
    // NÃO atualizar o estado principal aqui - apenas quando clicar "Aplicar"
  }, []);

  /**
   * Aplicar range customizado (aplica o filtro ao clicar no botão)
   */
  const applyCustomRange = useCallback(() => {
    const validation = DAFilterService.validateCustomRange(tempCustomRange);
    
    if (validation.isValid) {
      // Atualizar o estado principal apenas quando clicar "Aplicar"
      setState(prev => ({
        ...prev,
        customRange: { ...tempCustomRange }
      }));
      setIsOpen(false);
    } else {
      // Em um projeto real, você mostraria o erro para o usuário
      console.warn('Range inválido:', validation.error);
    }
  }, [tempCustomRange]);

  /**
   * Limpar todos os filtros
   */
  const clearFilters = useCallback(() => {
    setState({
      selectedRanges: [],
      customRange: { min: null, max: null }
    });
    setTempCustomRange({ min: null, max: null });
  }, []);

  /**
   * Formatar filtros selecionados para exibição
   */
  const formatSelectedFilters = useCallback(() => {
    return DAFilterService.formatFilterState(state, options);
  }, [state, options]);

  /**
   * Verificar se um valor de DA está dentro dos filtros selecionados
   */
  const isDAValueFiltered = useCallback((daValue: number) => {
    // Usar valores diretos ao invés de dependências
    const currentHasSelected = state.selectedRanges.length > 0 || 
                              state.customRange.min !== null || 
                              state.customRange.max !== null;
    
    if (!currentHasSelected) return true; // Se nenhum filtro, mostra todos
    
    return DAFilterService.isDAValueSelected(
      daValue, 
      state.selectedRanges, 
      state.customRange, 
      options
    );
  }, [state.selectedRanges, state.customRange.min, state.customRange.max, options]);

  return {
    state,
    tempCustomRange,
    isOpen,
    options,
    hasSelectedItems,
    toggleRange,
    setCustomRange,
    applyCustomRange,
    clearFilters,
    setIsOpen,
    formatSelectedFilters,
    isDAValueFiltered
  };
};
