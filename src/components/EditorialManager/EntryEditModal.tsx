import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import * as Fields from "../../components/form/fields";
import { useShoppingCartToCheckoutResume } from "../marketplace/actions/ShoppingCartToCheckoutResume";

// Import types and services
import { EntryEditModalProps } from "./types/entryTypes";
import { useFormFields } from "./hooks/useFormFields";
import { useFormValues } from "./hooks/useFormValues";
import { FormFieldsService } from "./services/formFieldsService";
import { FormSubmissionService } from "./services/formSubmissionService";
import { FormValidationService } from "./services/formValidationService";
import { useFormDataSync } from "./dataSync/hooks/useFormDataSync";
import FieldEditor from "./components/FieldEditor";

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
  const [error, setError] = useState("");

  // Initialize data sync for this form
  const formDataSync = useFormDataSync(entry?.form_id || '');

  // Update status when entry changes
  useEffect(() => {
    if (entry && isOpen) {
      setStatus(entry.status || "em_analise");
      setNote("");
      setError("");
    }
  }, [entry, isOpen]);

  const { syncPriceFromValue } = useShoppingCartToCheckoutResume();
  
  // Use custom hooks for form management
  const {
    fields,
    fieldSettings,
    fieldsLoading
  } = useFormFields(entry, isOpen);

  const {
    formValues,
    validationErrors,
    setValidationErrors,
    updateFormValue,
    clearValidationError
  } = useFormValues(entry, isOpen, fields);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setValidationErrors({});

      // Use the form submission service with UPSERT strategy
      const result = await FormSubmissionService.submitFormEntry({
        entry,
        status,
        note,
        formValues,
        fields,
        fieldSettings,
        syncPriceFromValue
      });

      if (result.success) {
        console.log(`✅ [EntryEditModal] Form submission successful, emitting data sync event`);
        
        // Emit data sync event to refresh all relevant tables
        await formDataSync.emitEntrySubmitted(entry.id, true, {
          status,
          formValues,
          note: note.trim()
        });
        
        // Call onSave callback for additional actions
        if (typeof onSave === 'function') {
          await onSave();
        }
        
        // Close modal after successful save and sync
        onClose();
        
        console.log(`✅ [EntryEditModal] Entry update process completed`);
      } else {
        setError(result.error || "Erro ao atualizar entrada");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Erro inesperado ao atualizar entrada");
    } finally {
      setLoading(false);
    }
  };

  // Render field editor based on field type
  const renderFieldEditor = (field: any) => {
    const settings = fieldSettings[field.id] || {};
    const value = formValues[field.id];
    const error = validationErrors[field.id];

    // Check field visibility based on user permissions
    if (!FormFieldsService.shouldFieldBeVisible(settings, isAdmin)) {
      return null;
    }

    // Skip button_buy fields in the edit modal
    if (field.field_type === "button_buy") {
      return null;
    }

    const handleChange = (newValue: any) => {
      updateFormValue(field.id, newValue);
    };

    const handleErrorClear = () => {
      clearValidationError(field.id);
    };

    // Função para extrair dados do produto dos formValues
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
    const fieldTypeMapped = FormFieldsService.mapFieldType(field.field_type);
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
          {FormValidationService.isFieldRequired(field) && <span className="text-error-500 ml-1">*</span>}
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
                {fields.map((field) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    fieldSettings={fieldSettings}
                    formValues={formValues}
                    validationErrors={validationErrors}
                    updateFormValue={updateFormValue}
                    clearValidationError={clearValidationError}
                    isAdmin={isAdmin}
                    fields={fields}
                  />
                ))}
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
