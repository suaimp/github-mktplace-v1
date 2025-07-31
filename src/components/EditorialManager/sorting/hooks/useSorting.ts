import { useState, useCallback, useMemo } from 'react';
import { SortableField, SortDirection } from '../types';
import { SortingConfigService } from '../services/SortingConfigService';

export interface UseSortingProps {
  initialSortField?: SortableField;
  initialSortDirection?: SortDirection;
  formFields?: any[];
}

export interface UseSortingReturn {
  sortField: SortableField;
  sortDirection: SortDirection;
  handleSort: (field: SortableField) => void;
  isFieldSortable: (field: SortableField) => boolean;
  isDatabaseSort: (field: SortableField) => boolean;
  applyClientSort: (entries: any[]) => any[];
  getSortIndicator: (field: SortableField) => 'asc' | 'desc' | null;
}

/**
 * Hook para gerenciar ordenação da tabela
 */
export function useSorting({ 
  initialSortField = 'created_at', 
  initialSortDirection = 'desc',
  formFields = []
}: UseSortingProps): UseSortingReturn {
  const [sortField, setSortField] = useState<SortableField>(initialSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  /**
   * Manipula mudança de ordenação
   */
  const handleSort = useCallback((field: SortableField) => {
    // Verificar se o campo é ordenável
    if (!SortingConfigService.isFieldSortable(field, formFields)) {
      console.warn(`Campo '${field}' não é ordenável`);
      return;
    }

    if (sortField === field) {
      // Trocar direção se é o mesmo campo
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Novo campo, começar com ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, formFields]);

  /**
   * Verifica se um campo é ordenável
   */
  const isFieldSortable = useCallback((field: SortableField): boolean => {
    return SortingConfigService.isFieldSortable(field, formFields);
  }, [formFields]);

  /**
   * Verifica se a ordenação deve ser feita no banco de dados
   */
  const isDatabaseSort = useCallback((field: SortableField): boolean => {
    return SortingConfigService.isDatabaseSortField(field);
  }, []);

  /**
   * Aplica ordenação no lado do cliente
   */
  const applyClientSort = useCallback((entries: any[]): any[] => {
    // Se é ordenação de banco de dados, não aplicar no cliente
    if (isDatabaseSort(sortField)) {
      return entries;
    }

    return SortingConfigService.applyClientSort(entries, sortField, sortDirection, formFields);
  }, [sortField, sortDirection, formFields, isDatabaseSort]);

  /**
   * Obtém indicador visual de ordenação para um campo
   */
  const getSortIndicator = useCallback((field: SortableField): 'asc' | 'desc' | null => {
    if (sortField === field) {
      return sortDirection;
    }
    return null;
  }, [sortField, sortDirection]);

  return useMemo(() => ({
    sortField,
    sortDirection,
    handleSort,
    isFieldSortable,
    isDatabaseSort,
    applyClientSort,
    getSortIndicator
  }), [
    sortField,
    sortDirection,
    handleSort,
    isFieldSortable,
    isDatabaseSort,
    applyClientSort,
    getSortIndicator
  ]);
}
