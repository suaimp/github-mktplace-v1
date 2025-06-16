import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import * as Fields from "../../components/form/fields";
import { useShoppingCartToCheckoutResume } from "../marketplace/actions/ShoppingCartToCheckoutResume";
import { getCommissionField } from "../../context/db-context/services/formFieldsService";
import { applyCommissionToFormValues } from "./actions/commissionLogic";

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

  const { syncPriceFromValue } = useShoppingCartToCheckoutResume();
  useEffect(() => {
    if (entry && isOpen) {
      setStatus(entry.status || "em_analise");
      setNote("");

      // Parse entry values similar to UserFormEntriesRenderer
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

      // Atualizar form values com tratamento adicional para campos específicos
      setFormValues((prev) => {
        const updatedValues = { ...prev };

        fieldsData.forEach((field: any) => {
          // Se for campo niche, garantir array de objetos
          if (field.field_type === "niche") {
            if (!Array.isArray(updatedValues[field.id])) {
              updatedValues[field.id] = [];
            } else {
              updatedValues[field.id] = updatedValues[field.id].map(
                (n: any) => {
                  if (typeof n === "string") return { niche: n, price: "" };
                  if (typeof n === "object" && n !== null && !("price" in n))
                    return { ...n, price: "" };
                  return n;
                }
              );
            }
          }
        });

        // Garante que o campo niche sempre exista, mesmo que não venha do backend
        const nicheField = fieldsData.find(
          (f: any) => f.field_type === "niche"
        );
        if (nicheField && !(nicheField.id in updatedValues)) {
          updatedValues[nicheField.id] = [];
        }

        return updatedValues;
      });
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
      setValidationErrors({}); // Buscar o field_id do campo de comissão
      const commissionField = await getCommissionField();
      const commissionFieldId = commissionField?.id;

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
      } // Update entry status
      const { error: updateError } = await supabase
        .from("form_entries")
        .update({ status })
        .eq("id", entry.id);
      if (updateError) throw updateError;

      const updatedValues: Array<{
        entry_id: any;
        field_id: string;
        value: string | null;
        value_json: any;
      }> = [];
      // Aplicar comissão aos valores usando a função do commissionLogic
      const formValuesWithCommission = applyCommissionToFormValues(
        formValues,
        commissionFieldId || null
      );
      for (const [fieldId, value] of Object.entries(formValuesWithCommission)) {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) continue; // Determine if value should be stored in value or value_json - same logic as UserFormEntriesRenderer
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
      if (deleteError) {
        throw deleteError;
      }

      // Insert new values
      const { error: insertError } = await supabase
        .from("form_entry_values")
        .insert(updatedValues);
      if (insertError) {
        throw insertError;
      }

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
      } // NOVA FUNCIONALIDADE: Sincronizar preços no cart_checkout_resume
      if (entry.entry_id) {
        try {
          await syncPriceFromValue(entry.entry_id);
        } catch (syncError) {
          // Não bloqueia o salvamento se a sincronização falhar
        }
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

    // Skip fields with visibility set to 'marketplace' unless in marketplace context
    if (settings.visibility === "marketplace" && !isAdmin) {
      return null;
    }

    // Skip button_buy fields in the edit modal
    if (field.field_type === "button_buy") {
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
    }; // Função para extrair dados do produto dos formValues
    const extractProductDataFromForm = () => {
      // Procura por campo de produto nos formValues
      const productField = fields.find((f) => f.field_type === "product");
      if (productField && formValues[productField.id]) {
        return formValues[productField.id];
      }
      return null;
    };

    const fieldProps = {
      field,
      settings,
      value,
      onChange: handleChange,
      error,
      onErrorClear: handleErrorClear,
      // Parâmetros adicionais para CommissionField (simulador de preço)
      productData: extractProductDataFromForm()
    };

    // Get the appropriate field component based on field type
    const fieldTypeMapped = mapFieldType(field.field_type);
    const FieldComponent = (Fields as any)[
      `${
        fieldTypeMapped.charAt(0).toUpperCase() + fieldTypeMapped.slice(1)
      }Field`
    ];

    if (!FieldComponent) {
      return (
        <div className="text-error-500">
          Unknown field type: {field.field_type} (mapped to {fieldTypeMapped})
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
          {settings.visibility === "marketplace" && (
            <span className="ml-2 text-xs text-warning-500 dark:text-warning-400">
              (Marketplace Only)
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

    // Map button_buy field to use ButtonBuyField component
    if (fieldType === "button_buy") {
      return "buttonBuy";
    }

    // Map multiselect field to use MultiSelectField component
    if (fieldType === "multiselect") {
      return "multiSelect";
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
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
