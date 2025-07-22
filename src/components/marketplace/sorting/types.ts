/**
 * Tipos e interfaces para o sistema de ordenação da tabela marketplace
 */

export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string | null;
  direction: SortDirection;
}

export interface SortableField {
  id: string;
  field_type: string;
  label?: string;
}

export interface MarketplaceEntry {
  id: string;
  values: Record<string, any>;
  [key: string]: any;
}

export interface SortConfig {
  fields: SortableField[];
  entries: MarketplaceEntry[];
  sortState: SortState;
}
