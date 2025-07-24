import { useState, useEffect } from "react";
import { FormField, FormFieldSettings } from "../types/entryTypes";
import { FormFieldsService } from "../services/formFieldsService";

/**
 * Hook for managing form fields state and operations
 */
export function useFormFields(entry: any, isOpen: boolean) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldSettings, setFieldSettings] = useState<FormFieldSettings>({});
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry && isOpen) {
      loadFormFields();
    }
  }, [entry, isOpen]);

  const loadFormFields = async () => {
    if (!entry?.form_id) return;

    try {
      setFieldsLoading(true);
      setError("");

      const result = await FormFieldsService.loadFormFields(entry.form_id);
      
      if (result.error) {
        throw result.error;
      }

      setFields(result.fields);
      setFieldSettings(result.fieldSettings);
    } catch (err) {
      console.error("Error loading form fields:", err);
      setError("Error loading form fields");
    } finally {
      setFieldsLoading(false);
    }
  };

  return {
    fields,
    fieldSettings,
    fieldsLoading,
    error,
    setError,
    loadFormFields
  };
}
