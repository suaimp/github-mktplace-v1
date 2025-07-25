/**
 * Interface para representar um valor de campo processado
 */
export interface ProcessedFieldValue {
  value: string | null;
  valueJson: any;
}

/**
 * Serviço responsável por mapear valores padrão para campos não preenchidos
 * Segue exatamente o padrão dos registros manuais funcionais
 */
export class FieldDefaultValueMapper {
  
  /**
   * Mapeia valor padrão baseado no tipo do campo seguindo padrão dos registros manuais
   */
  static getDefaultValueForField(field: any): ProcessedFieldValue {
    const result: ProcessedFieldValue = { value: null, valueJson: null };
    
    // Apenas campos obrigatórios recebem valores padrão
    if (!field.is_required) {
      return result; // Campos opcionais sempre NULL
    }

    switch (field.field_type) {
      case 'category':
        // Categoria: value = null, value_json = ["Default"]
        result.value = null;
        result.valueJson = ["Geral"];
        break;

      case 'number':
        // Números: value = "0", value_json = null
        result.value = "0";
        result.valueJson = null;
        break;

      case 'select':
        // Select: verificar primeiro se é campo específico
        console.log(`🔍 [FieldDefaultValueMapper] Analisando campo select: "${field.label}" - id: ${field.id}`);
        
        if (field.label?.toLowerCase().includes('patrocinado') || field.id === '445441d1-bde2-4895-ae47-3da4ea03d6f7') {
          // Campo "Artigo é patrocinado" sempre usa "Não"
          console.log(`✅ [FieldDefaultValueMapper] Campo patrocinado detectado! Usando "Não"`);
          result.value = "Não";
        } else {
          // Para outros selects, usar primeira opção disponível
          const settings = field.form_field_settings;
          if (settings?.options && Array.isArray(settings.options) && settings.options.length > 0) {
            console.log(`📋 [FieldDefaultValueMapper] Campo select "${field.label}" tem ${settings.options.length} opções:`, settings.options);
            result.value = settings.options[0].value || settings.options[0];
            console.log(`✅ [FieldDefaultValueMapper] Usando primeira opção: "${result.value}"`);
          } else {
            console.log(`⚠️ [FieldDefaultValueMapper] Campo select "${field.label}" sem opções, usando padrão "Não"`);
            result.value = "Não"; // Padrão geral para selects sem opções
          }
        }
        result.valueJson = null;
        break;

      case 'multiselect':
        // Multiselect: value = null, value_json = {"BR":true} ou similar
        result.value = null;
        result.valueJson = {"BR": true};
        break;

      case 'checkbox':
        // Checkbox: value = null, value_json = [] ou array vazio
        result.value = null;
        result.valueJson = [];
        break;

      case 'product':
        // Product/Price: value = null, value_json = objeto completo
        result.value = null;
        result.valueJson = {
          price: "0,00",
          old_price: "0,00",
          promotional_price: "0,00",
          old_promotional_price: "0,00"
        };
        break;

      case 'niche':
        // Nicho: value = null, value_json = []
        result.value = null;
        result.valueJson = [];
        break;

      case 'text':
      case 'textarea':
        // Texto: value = "valor", value_json = null
        result.value = "Não informado";
        result.valueJson = null;
        break;

      case 'email':
        // Email: value = "email", value_json = null
        result.value = "nao-informado@exemplo.com";
        result.valueJson = null;
        break;

      case 'url':
        // URL: value = "url", value_json = null
        result.value = "https://www.exemplo.com";
        result.valueJson = null;
        break;

      default:
        // Default para campos obrigatórios não mapeados
        result.value = "Padrão";
        result.valueJson = null;
        break;
    }

    return result;
  }

  /**
   * Verifica se um valor processado deve ser salvo na base de dados
   */
  static shouldSaveValue(processedValue: ProcessedFieldValue): boolean {
    return processedValue.value !== null || processedValue.valueJson !== null;
  }
}
