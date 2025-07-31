/**
 * Hook integrado para gerenciar ordenação com suporte a ordenação padrão
 * Responsabilidade: Combinar useSorting com useDefaultSorting
 */

import { useSorting } from "../useSorting";
import { useDefaultSorting } from "./useDefaultSorting";
import { SortableField } from "../types";

export interface UseMarketplaceSortingProps {
  fields: SortableField[];
  initialField?: string;
  initialDirection?: "asc" | "desc";
}

export function useMarketplaceSorting({
  fields,
  initialField,
  initialDirection = "desc"
}: UseMarketplaceSortingProps) {
  
  const {
    sortState,
    handleSort,
    setSorting,
    clearSorting,
    hasActiveSorting
  } = useSorting(initialField, initialDirection);

  const {
    resetToDefaultSorting,
    applyDefaultSorting
  } = useDefaultSorting({
    fields,
    onSortChange: setSorting,
    currentSortField: sortState.field
  });

  return {
    sortState,
    handleSort,
    setSorting,
    clearSorting,
    hasActiveSorting,
    resetToDefaultSorting,
    applyDefaultSorting
  };
}
