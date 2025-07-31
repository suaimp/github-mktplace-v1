import { FieldSortConfig, SortDirection } from '../types';

/**
 * Serviço para configuração e mapeamento de ordenação de campos
 */
export class SortingConfigService {
  /**
   * Configurações de ordenação para campos padrão da tabela
   */
  private static readonly DEFAULT_SORT_CONFIGS: Record<string, FieldSortConfig> = {
    created_at: {
      field: 'created_at',
      sortable: true,
      sortType: 'database',
      dbColumn: 'created_at'
    },
    updated_at: {
      field: 'updated_at', 
      sortable: true,
      sortType: 'database',
      dbColumn: 'updated_at'
    },
    status: {
      field: 'status',
      sortable: true,
      sortType: 'database',
      dbColumn: 'status'
    },
    publisher: {
      field: 'publisher',
      sortable: true,
      sortType: 'client',
      customSort: (entries: any[], direction: SortDirection) => {
        return entries.sort((a, b) => {
          const nameA = a.publisher ? `${a.publisher.first_name} ${a.publisher.last_name}`.toLowerCase() : '';
          const nameB = b.publisher ? `${b.publisher.first_name} ${b.publisher.last_name}`.toLowerCase() : '';
          
          if (direction === 'asc') {
            return nameA.localeCompare(nameB);
          } else {
            return nameB.localeCompare(nameA);
          }
        });
      }
    }
  };

  /**
   * Gera configuração de ordenação para campos dinâmicos do formulário
   */
  static generateFieldSortConfig(field: any): FieldSortConfig {
    const isTextBasedField = ['text', 'textarea', 'email', 'url', 'select'].includes(field.field_type);
    const isNumericField = ['number', 'product', 'commission'].includes(field.field_type);
    
    return {
      field: field.id,
      sortable: true,
      sortType: 'client', // Campos dinâmicos são ordenados no client
      customSort: (entries: any[], direction: SortDirection) => {
        return entries.sort((a, b) => {
          const valueA = a.values[field.id];
          const valueB = b.values[field.id];
          
          // Tratar valores vazios/null
          if (!valueA && !valueB) return 0;
          if (!valueA) return direction === 'asc' ? -1 : 1;
          if (!valueB) return direction === 'asc' ? 1 : -1;
          
          let compareA = valueA;
          let compareB = valueB;
          
          // Para campos de produto, usar o preço
          if (field.field_type === 'product') {
            compareA = valueA?.price || 0;
            compareB = valueB?.price || 0;
          }
          // Para campos numéricos
          else if (isNumericField) {
            compareA = parseFloat(valueA) || 0;
            compareB = parseFloat(valueB) || 0;
          }
          // Para campos de texto
          else if (isTextBasedField) {
            compareA = String(valueA).toLowerCase();
            compareB = String(valueB).toLowerCase();
          }
          
          // Comparação
          if (isNumericField || field.field_type === 'product') {
            return direction === 'asc' ? compareA - compareB : compareB - compareA;
          } else {
            return direction === 'asc' 
              ? compareA.localeCompare(compareB)
              : compareB.localeCompare(compareA);
          }
        });
      }
    };
  }

  /**
   * Obtém configuração de ordenação para um campo específico
   */
  static getSortConfig(fieldId: string, formFields?: any[]): FieldSortConfig | null {
    // Primeiro, verificar campos padrão
    if (this.DEFAULT_SORT_CONFIGS[fieldId]) {
      return this.DEFAULT_SORT_CONFIGS[fieldId];
    }

    // Se não é campo padrão, procurar nos campos do formulário
    if (formFields) {
      const field = formFields.find(f => f.id === fieldId);
      if (field) {
        return this.generateFieldSortConfig(field);
      }
    }

    return null;
  }

  /**
   * Verifica se um campo é ordenável
   */
  static isFieldSortable(fieldId: string, formFields?: any[]): boolean {
    const config = this.getSortConfig(fieldId, formFields);
    return config?.sortable ?? false;
  }

  /**
   * Obtém o mapeamento de colunas do banco de dados para ordenação
   */
  static getDatabaseSortColumns(): Record<string, string> {
    const dbColumns: Record<string, string> = {};
    
    Object.entries(this.DEFAULT_SORT_CONFIGS).forEach(([key, config]) => {
      if (config.sortType === 'database' && config.dbColumn) {
        dbColumns[key] = config.dbColumn;
      }
    });

    return dbColumns;
  }

  /**
   * Verifica se um campo deve ser ordenado no banco de dados
   */
  static isDatabaseSortField(fieldId: string): boolean {
    const config = this.DEFAULT_SORT_CONFIGS[fieldId];
    return config ? config.sortType === 'database' : false;
  }

  /**
   * Aplica ordenação no lado do cliente para campos que não podem ser ordenados no DB
   */
  static applyClientSort(entries: any[], sortField: string, sortDirection: SortDirection, formFields?: any[]): any[] {
    const config = this.getSortConfig(sortField, formFields);
    
    if (!config || !config.customSort) {
      return entries;
    }

    return config.customSort(entries, sortDirection);
  }
}
