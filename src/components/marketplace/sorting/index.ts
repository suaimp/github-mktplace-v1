/**
 * Arquivo de índice para o módulo de ordenação do marketplace
 * Centraliza as exportações do sistema de sorting
 */

export { useSorting } from "./useSorting";
export { useDefaultSorting } from "./hooks/useDefaultSorting";
export { useMarketplaceSorting } from "./hooks/useMarketplaceSorting";
export { sortEntries, extractSortValue, compareValues } from "./sortUtils";
export { FieldDetectionService } from "./services/FieldDetectionService";
export type { 
  SortDirection, 
  SortState, 
  SortableField, 
  MarketplaceEntry, 
  SortConfig 
} from "./types";
