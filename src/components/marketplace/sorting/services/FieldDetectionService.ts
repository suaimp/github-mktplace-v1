/**
 * Serviço para detectar tipos específicos de campos na tabela marketplace
 * Responsabilidade: Identificar campos com base em seus tipos ou configurações
 */

import { SortableField } from "../types";

export class FieldDetectionService {
  /**
   * Detecta o campo DA (Domain Authority) na lista de campos
   * Prioriza moz_da, mas pode detectar outros tipos relacionados
   */
  static findDAField(fields: SortableField[]): SortableField | null {
    // Prioridade para moz_da
    const mozDAField = fields.find(field => field.field_type === "moz_da");
    if (mozDAField) {
      return mozDAField;
    }

    // Fallback para outros campos de autoridade se moz_da não existir
    const authorityFields = [
      "domain_authority",
      "da",
      "authority",
      "ahrefs_dr", // Domain Rating do Ahrefs como alternativa
    ];

    for (const fieldType of authorityFields) {
      const field = fields.find(f => f.field_type === fieldType);
      if (field) {
        return field;
      }
    }

    return null;
  }

  /**
   * Verifica se um campo é sortable (ordenável)
   * Usado para determinar quais campos podem ser ordenados
   */
  static isSortableField(field: SortableField): boolean {
    const sortableTypes = [
      "moz_da",
      "domain_authority", 
      "ahrefs_dr",
      "ahrefs_traffic",
      "similarweb_traffic",
      "google_traffic",
      "semrush_as",
      "product",
      "commission",
      "number",
      "text",
      "url"
    ];

    return sortableTypes.includes(field.field_type);
  }

  /**
   * Detecta campos de tráfego para ordenação alternativa
   */
  static findTrafficFields(fields: SortableField[]): SortableField[] {
    const trafficTypes = [
      "ahrefs_traffic",
      "similarweb_traffic", 
      "google_traffic",
      "semrush_traffic"
    ];

    return fields.filter(field => trafficTypes.includes(field.field_type));
  }
}
