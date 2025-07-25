import { FormField } from "../types";

/**
 * Serviço responsável pelo mapeamento de campos CSV
 */
export class FieldMappingService {
  /**
   * Cria um mapa de field_key -> field_id para facilitar o mapeamento
   */
  static createFieldMap(formFields: FormField[]): Map<string, string> {
    const fieldMap = new Map<string, string>();
    
    formFields.forEach(field => {
      // Mapear por key ou field_key
      const fieldKey = field.key || field.field_key;
      if (fieldKey) {
        fieldMap.set(fieldKey, field.id);
      }
      
      // Mapear por label normalizado
      if (field.label) {
        const labelKey = this.normalizeLabel(field.label);
        fieldMap.set(labelKey, field.id);
      }
    });

    console.log("🗺️ [FieldMappingService] FieldMap criado:", Object.fromEntries(fieldMap));
    return fieldMap;
  }

  /**
   * Normaliza um label para criar uma chave de mapeamento
   */
  private static normalizeLabel(label: string): string {
    return label.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .replace('url_do_site', 'url')
      .replace('da_domain_authority', 'da')
      .replace('preço', 'preco');
  }

  /**
   * Valida se todos os campos requeridos estão presentes no mapeamento
   */
  static validateRequiredFields(fieldMap: Map<string, string>, requiredFields: string[]): string | null {
    for (const fieldKey of requiredFields) {
      if (!fieldMap.has(fieldKey)) {
        return `Campo '${fieldKey}' não encontrado no formulário`;
      }
    }
    return null;
  }
}
