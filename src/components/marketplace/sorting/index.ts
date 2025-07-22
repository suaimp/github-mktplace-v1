/**
 * Arquivo de índice para o módulo de ordenação do marketplace
 * Centraliza as exportações do sistema de sorting
 */

export { useSorting } from "./useSorting";
export { sortEntries, extractSortValue, compareValues } from "./sortUtils";
export type { 
  SortDirection, 
  SortState, 
  SortableField, 
  MarketplaceEntry, 
  SortConfig 
} from "./types";
