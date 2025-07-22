import { useState, useCallback } from "react";
import { SortState, SortDirection } from "./types";

/**
 * Hook para gerenciar o estado de ordenação da tabela marketplace
 */
export function useSorting(initialField?: string, initialDirection: SortDirection = "desc") {
  const [sortState, setSortState] = useState<SortState>({
    field: initialField || null,
    direction: initialDirection,
  });

  /**
   * Manipula o clique no cabeçalho de uma coluna para ordenação
   * Se o campo já está selecionado, alterna a direção
   * Se é um novo campo, define como padrão descendente
   */
  const handleSort = useCallback((fieldId: string) => {
    setSortState((prevState) => {
      if (prevState.field === fieldId) {
        // Alterna a direção se o campo é o mesmo
        return {
          field: fieldId,
          direction: prevState.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Define novo campo com direção padrão descendente
        return {
          field: fieldId,
          direction: "desc",
        };
      }
    });
  }, []);

  /**
   * Define o estado de ordenação programaticamente
   */
  const setSorting = useCallback((field: string | null, direction: SortDirection) => {
    setSortState({ field, direction });
  }, []);

  /**
   * Limpa a ordenação
   */
  const clearSorting = useCallback(() => {
    setSortState({ field: null, direction: "desc" });
  }, []);

  return {
    sortState,
    handleSort,
    setSorting,
    clearSorting,
  };
}
