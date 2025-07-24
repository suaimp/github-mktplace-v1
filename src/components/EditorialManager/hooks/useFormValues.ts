import { useState, useEffect } from "react";
import { ValidationError } from "../types/entryTypes";

/**
 * Hook for managing form values state and validation
 */
export function useFormValues(entry: any, isOpen: boolean, fields: any[]) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});

  useEffect(() => {
    if (entry && isOpen) {
      parseEntryValues();
    }
  }, [entry, isOpen]);

  useEffect(() => {
    if (fields.length > 0) {
      updateFormValuesForSpecialFields();
    }
  }, [fields]);

  const parseEntryValues = () => {
    if (entry?.values) {
      const parsedValues: Record<string, any> = {};

      Object.entries(entry.values).forEach(
        ([fieldId, value]: [string, any]) => {
          let fieldValue = value;

          // Se o valor é uma string, tenta fazer parse para ver se é JSON
          if (typeof value === "string") {
            try {
              const parsedValue = JSON.parse(value);
              if (parsedValue && typeof parsedValue === "object") {
                fieldValue = parsedValue;
              }
            } catch {
              // Se não conseguir fazer parse, mantém o valor original
              fieldValue = value;
            }
          }

          parsedValues[fieldId] = fieldValue;
        }
      );

      setFormValues(parsedValues);
    } else {
      setFormValues({});
    }
  };

  const updateFormValuesForSpecialFields = () => {
    setFormValues((prev) => {
      const updatedValues = { ...prev };
      
      fields.forEach((field: any) => {
        // Se for campo niche, garantir array de objetos
        if (field.field_type === "niche") {
          if (!Array.isArray(updatedValues[field.id])) {
            updatedValues[field.id] = [];
          } else {
            // Processar dados de nicho corretamente
            const nicheItems = updatedValues[field.id].map((item: any) => {
              if (typeof item === "string") {
                return { niche: item, price: "" };
              }

              if (typeof item === "object" && item.niche) {
                // Se niche é uma string JSON, tenta fazer parse
                if (
                  typeof item.niche === "string" &&
                  item.niche.startsWith("{")
                ) {
                  try {
                    const parsedNiche = JSON.parse(item.niche);
                    return {
                      niche: parsedNiche.text || parsedNiche.niche || item.niche,
                      price: item.price || "",
                      icon: parsedNiche.icon // Preservar o ícone
                    };
                  } catch {
                    return {
                      niche: item.niche,
                      price: item.price || ""
                    };
                  }
                } else {
                  return {
                    niche: item.niche,
                    price: item.price || "",
                    icon: item.icon // Preservar o ícone
                  };
                }
              }

              // Se o item já tem a propriedade text (dados antigos), converter para niche
              if (typeof item === "object" && item.text && !item.niche) {
                return {
                  niche: item.text,
                  price: item.price || ""
                };
              }
              return item;
            });

            updatedValues[field.id] = nicheItems;
          }
        }
      });

      // Garante que o campo niche sempre exista, mesmo que não venha do backend
      const nicheField = fields.find(
        (f: any) => f.field_type === "niche"
      );
      if (nicheField && !(nicheField.id in updatedValues)) {
        updatedValues[nicheField.id] = [];
      }

      return updatedValues;
    });
  };

  const updateFormValue = (fieldId: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear validation error
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const clearValidationError = (fieldId: string) => {
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  return {
    formValues,
    validationErrors,
    setValidationErrors,
    updateFormValue,
    clearValidationError
  };
}
