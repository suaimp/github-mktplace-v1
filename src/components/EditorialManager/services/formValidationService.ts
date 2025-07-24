import { FormField, ValidationError } from "../types/entryTypes";

/**
 * Service responsible for form field validation
 */
export class FormValidationService {
  /**
   * Validates a single field value
   */
  static validateField(
    field: FormField, 
    value: any, 
    fieldSettings: Record<string, any>
  ): string | null {
    if (
      field.is_required &&
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

    fields.forEach((field) => {
      const error = this.validateField(field, formValues[field.id], fieldSettings);
      if (error) {
        errors[field.id] = error;
      }
    });

    return errors;
  }

  /**
   * Checks if validation errors exist
   */
  static hasValidationErrors(errors: ValidationError): boolean {
    return Object.keys(errors).length > 0;
  }
}
