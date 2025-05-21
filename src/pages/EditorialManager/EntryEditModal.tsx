import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import * as FieldsImport from "../../components/form/fields";

const Fields = FieldsImport as Record<string, React.ComponentType<any>>;

interface EntryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  onSave: () => void;
  isAdmin: boolean;
}

export default function EntryEditModal({
  isOpen,
  onClose,
  entry,
  onSave,
  isAdmin
}: EntryEditModalProps) {
  const [status, setStatus] = useState(entry?.status || "em_analise");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<any[]>([]);
  const [fieldSettings, setFieldSettings] = useState<Record<string, any>>({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (entry && isOpen) {
      setStatus(entry.status || "em_analise");
      setNote("");
      setFormValues(entry.values || {});
      loadFormFields();
    }
  }, [entry, isOpen]);

  async function loadFormFields() {
    if (!entry?.form_id) return;

    try {
      setFieldsLoading(true);
      setError("");

      // Load form fields with settings
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(
          `
          *,
          form_field_settings (*)
        `
        )
        .eq("form_id", entry.form_id)
        .order("position", { ascending: true });

      if (fieldsError) throw fieldsError;

      // Create settings map
      const settingsMap: Record<string, any> = {};
      fieldsData.forEach((field: any) => {
        if (field.form_field_settings) {
          settingsMap[field.id] = field.form_field_settings;
        }
      });

      setFields(fieldsData || []);
      setFieldSettings(settingsMap);
    } catch (err) {
      console.error("Error loading form fields:", err);
      setError("Error loading form fields");
    } finally {
      setFieldsLoading(false);
    }
  }

  const validateField = (field: any, value: any): string | null => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setValidationErrors({});

      // Validate all fields
      const errors: Record<string, string> = {};
      fields.forEach((field) => {
        const error = validateField(field, formValues[field.id]);
        if (error) {
          errors[field.id] = error;
        }
      });

      // If there are validation errors, show them and stop submission
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
      }

      // Update entry status
      const { error: updateError } = await supabase
        .from("form_entries")
        .update({ status })
        .eq("id", entry.id);

      if (updateError) throw updateError;

      // Update entry values
      const updatedValues = [];
      for (const [fieldId, value] of Object.entries(formValues)) {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) continue;

        // Determine if value should be stored in value or value_json
        const isJsonValue = typeof value !== "string";

        updatedValues.push({
          entry_id: entry.id,
          field_id: fieldId,
          value: isJsonValue ? null : value,
          value_json: isJsonValue ? value : null
        });
      }

      // Delete existing values
      const { error: deleteError } = await supabase
        .from("form_entry_values")
        .delete()
        .eq("entry_id", entry.id);

      if (deleteError) throw deleteError;

      // Insert new values
      const { error: insertError } = await supabase
        .from("form_entry_values")
        .insert(updatedValues);

      if (insertError) throw insertError;

      // Add note if provided
      if (note.trim()) {
        const {
          data: { user }
        } = await supabase.auth.getUser();

        const { error: noteError } = await supabase
          .from("form_entry_notes")
          .insert([
            {
              entry_id: entry.id,
              note: note.trim(),
              created_by: user?.id
            }
          ]);

        if (noteError) throw noteError;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error updating entry:", err);
      setError("Erro ao atualizar entrada");
    } finally {
      setLoading(false);
    }
  };

  // Render field editor based on field type
  const renderFieldEditor = (field: any) => {
    const settings = fieldSettings[field.id] || {};
    const value = formValues[field.id];
    const error = validationErrors[field.id];

    // Skip fields with visibility set to 'hidden' unless user is admin
    if (settings.visibility === "hidden" && !isAdmin) {
      return null;
    }

    // Skip fields with visibility set to 'admin' unless user is admin
    if (settings.visibility === "admin" && !isAdmin) {
      return null;
    }

    const handleChange = (newValue: any) => {
      setFormValues((prev) => ({
        ...prev,
        [field.id]: newValue
      }));

      // Clear validation error
      if (error) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[field.id];
          return next;
        });
      }
    };

    const handleErrorClear = () => {
      if (error) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[field.id];
          return next;
        });
      }
    };

    const fieldProps = {
      field,
      settings,
      value,
      onChange: handleChange,
      error,
      onErrorClear: handleErrorClear
    };

    // Get the appropriate field component based on field type
    const fieldTypeMapped = mapFieldType(field.field_type);
    const FieldComponent = (Fields as Record<string, React.ComponentType<any>>)[
      `${
        fieldTypeMapped.charAt(0).toUpperCase() + fieldTypeMapped.slice(1)
      }Field`
    ];

    if (!FieldComponent) {
      return (
        <div className="text-error-500">
          Unknown field type: {field.field_type}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
          {field.label}
          {field.is_required && <span className="text-error-500 ml-1">*</span>}
          {settings.visibility === "admin" && (
            <span className="ml-2 text-xs text-brand-500 dark:text-brand-400">
              (Admin Only)
            </span>
          )}
        </label>
        <FieldComponent {...fieldProps} />
      </div>
    );
  };

  // Map API field types to appropriate field components
  const mapFieldType = (fieldType: string): string => {
    // Map API field types to use ApiField component
    const apiFieldTypes = [
      "moz_da",
      "semrush_as",
      "ahrefs_dr",
      "ahrefs_traffic",
      "similarweb_traffic",
      "google_traffic"
    ];

    if (apiFieldTypes.includes(fieldType)) {
      return "api";
    }

    // Map commission field to use CommissionField component
    if (fieldType === "commission") {
      return "commission";
    }

    // Map brazilian_states field to use BrazilianStatesField component
    if (fieldType === "brazilian_states") {
      return "brazilianStates";
    }

    // Map brand field to use BrandField component
    if (fieldType === "brand") {
      return "brand";
    }

    // Return original field type for standard fields
    return fieldType;
  };

  if (!entry) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] m-4">
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Editar Entrada
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {entry.form?.title || "Formulário sem título"}
          </p>
        </div>

        {fieldsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500 dark:text-gray-400">
              Carregando campos...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
                {error}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                Dados do Formulário
              </h5>

              <div className="grid grid-cols-1 gap-6">
                {fields.map((field) => renderFieldEditor(field))}

                {fields.length === 0 && (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhum campo encontrado para este formulário
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                Status
              </h5>

              <Select
                options={[
                  { value: "em_analise", label: "Em Análise" },
                  { value: "verificado", label: "Verificado" },
                  { value: "reprovado", label: "Reprovado" }
                ]}
                value={status}
                onChange={(value) => setStatus(value)}
              />
            </div>

            <div>
              <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                Adicionar Nota
              </h5>

              <TextArea
                value={note}
                onChange={setNote}
                rows={4}
                placeholder="Adicione uma nota sobre esta entrada..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
