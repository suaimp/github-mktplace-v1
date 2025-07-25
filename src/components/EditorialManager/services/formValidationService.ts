import { FormField, ValidationError } from "../types/entryTypes";

/**
 * Service responsible for form field validation
 */
export class FormValidationService {
  /**
   * Checks if a field should be required (only URL, DA, and Price fields)
   */
  static isFieldRequired(field: FormField): boolean {
    // Check for URL field (but exclude "Tipo de Link de Saída" which contains "URL")
    if (field.field_type === 'url' || 
        (field.label?.toLowerCase().includes('url') && 
         !field.label?.toLowerCase().includes('tipo de link') &&
         !field.label?.toLowerCase().includes('saída')) ||
        field.label?.toLowerCase().includes('site')) {
      return true;
    }
    
    // Check for DA field (specifically Domain Authority, not generic DA)
    if ((field.label?.toLowerCase().includes('da ') && !field.label?.toLowerCase().includes('tipo')) ||
        field.label?.toLowerCase().includes('domain authority') ||
        (field.field_type === 'number' && field.label?.toLowerCase().includes('domain'))) {
      return true;
    }
    
    // Check for Price field
    if (field.field_type === 'product' ||
        field.label?.toLowerCase().includes('preço') ||
        field.label?.toLowerCase().includes('preco') ||
        field.label?.toLowerCase().includes('price')) {
      return true;
    }
    
    return false;
  }

  /**
   * Validates a single field value
   */
  static validateField(
    field: FormField, 
    value: any, 
    fieldSettings: Record<string, any>
  ): string | null {
    // Only validate as required if it's one of our specific required fields
    const isRequired = this.isFieldRequired(field);
    
    if (
      isRequired &&
      (value === null || value === undefined || value === "")
    ) {
      return "Este campo é obrigatório";
    }

    if (!value) return null;

    switch (field.field_type) {
      case "email":
        if (!value.includes("@")) {
          return "Por favor, insira um endereço de email válido com @";
        }
        break;

      case "url":
        try {
          new URL(value);
        } catch {
          return "Por favor, insira uma URL válida";
        }
        break;

      case "number":
        if (isNaN(Number(value))) {
          return "Por favor, insira um número válido";
        }
        break;

      case "multiselect":
      case "checkbox":
        const settings = fieldSettings[field.id];
        if (
          settings?.max_selections &&
          Array.isArray(value) &&
          value.length > settings.max_selections
        ) {
          return `Você pode selecionar no máximo ${settings.max_selections} opções`;
        }
        break;

      case "commission":
        const commission = parseFloat(value);
        if (isNaN(commission) || commission < 0 || commission > 1000) {
          return "Commission must be between 0 and 1000";
        }
        break;
    }

    return null;
  }

  /**
   * Validates all form fields
   */
  static validateAllFields(
    fields: FormField[],
    formValues: Record<string, any>,
    fieldSettings: Record<string, any>
  ): ValidationError {
    const errors: ValidationError = {};

    console.log("🔍 [FormValidationService] Validando", fields.length, "campos");

    fields.forEach((field) => {
      const value = formValues[field.id];
      const isRequired = this.isFieldRequired(field);
      
      if (isRequired) {
        console.log(`🔍 [FormValidationService] Campo obrigatório: ${field.label} (${field.field_type}) = `, value);
      }
      
      const error = this.validateField(field, value, fieldSettings);
      if (error) {
        console.log(`❌ [FormValidationService] ERRO: ${field.label} - ${error}`);
        errors[field.id] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      console.log("❌ [FormValidationService] Total de erros:", Object.keys(errors).length);
      console.log("❌ [FormValidationService] Detalhes dos erros:", errors);
    } else {
      console.log("✅ [FormValidationService] Validação concluída sem erros");
    }

    return errors;
  }

  /**
   * Checks if validation errors exist
   */
  static hasValidationErrors(errors: ValidationError): boolean {
    return Object.keys(errors).length > 0;
  }
}
