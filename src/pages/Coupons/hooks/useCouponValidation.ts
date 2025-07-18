import { CreateCouponInput, UpdateCouponInput } from "../types";

interface ValidationError {
  field: string;
  message: string;
}

export const useCouponValidation = () => {
  const validateCoupon = (formData: CreateCouponInput | UpdateCouponInput): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validações obrigatórias
    if (!formData.code?.trim()) {
      errors.push({ field: "code", message: "Código é obrigatório" });
    }

    if (!formData.name?.trim()) {
      errors.push({ field: "name", message: "Nome é obrigatório" });
    }

    if ((formData.discount_value ?? 0) <= 0) {
      errors.push({ field: "discount_value", message: "Valor do desconto deve ser maior que zero" });
    }

    // Validações específicas por tipo de desconto
    if (formData.discount_type === "percentage" && (formData.discount_value ?? 0) > 100) {
      errors.push({ field: "discount_value", message: "Desconto percentual não pode ser maior que 100%" });
    }

    // Validação de valores máximo e mínimo
    if (formData.maximum_amount && formData.minimum_amount && formData.maximum_amount <= formData.minimum_amount) {
      errors.push({ field: "maximum_amount", message: "Valor máximo deve ser maior que o valor mínimo" });
    }

    // Validação de datas
    if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      errors.push({ field: "end_date", message: "Data de fim deve ser posterior à data de início" });
    }

    // Validação de limites
    if (formData.usage_limit && formData.usage_limit < 1) {
      errors.push({ field: "usage_limit", message: "Limite de uso deve ser maior que zero" });
    }

    if (formData.usage_limit_per_customer && formData.usage_limit_per_customer < 1) {
      errors.push({ field: "usage_limit_per_customer", message: "Limite de uso por cliente deve ser maior que zero" });
    }

    return errors;
  };

  const getFirstErrorMessage = (errors: ValidationError[]): string | null => {
    return errors.length > 0 ? errors[0].message : null;
  };

  const hasErrors = (errors: ValidationError[]): boolean => {
    return errors.length > 0;
  };

  return {
    validateCoupon,
    getFirstErrorMessage,
    hasErrors
  };
};
