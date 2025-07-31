/**
 * Tipos para sistema de ordenação da tabela de entradas
 */

export type SortableField = 
  | 'created_at'
  | 'updated_at' 
  | 'status'
  | 'publisher'
  | string; // Para campos dinâmicos do formulário

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortableField;
  direction: SortDirection;
}

/**
 * Configuração de ordenação para diferentes tipos de campos
 */
export interface FieldSortConfig {
  field: string;
  sortable: boolean;
  sortType: 'database' | 'client' | 'hybrid';
  dbColumn?: string;
  customSort?: (entries: any[], direction: SortDirection) => any[];
}

export interface SortColumnMapping {
  [key: string]: FieldSortConfig;
}
