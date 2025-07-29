import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
 
import { useShoppingCartToCheckoutResume } from "../marketplace/actions/ShoppingCartToCheckoutResume";

// Import types and services
import { EntryEditModalProps } from "./types/entryTypes";
import { useFormFields } from "./hooks/useFormFields";
import { useFormValues } from "./hooks/useFormValues";
 
import { FormSubmissionService } from "./services/formSubmissionService";
 
import { useFormDataSync } from "./dataSync/hooks/useFormDataSync";
import FieldEditor from "./components/FieldEditor";

// Import new toast system
import { useEntryToast } from "./toast";

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

  // Initialize data sync for this form
  const formDataSync = useFormDataSync(entry?.form_id || '');

  // Initialize toast system
  const { 
    showEntryUpdated, 
    showUpdateFailed, 
    showUnexpectedError 
  } = useEntryToast();

  // Update status when entry changes
  useEffect(() => {
    if (entry && isOpen) {
      setStatus(entry.status || "em_analise");
      setNote("");
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
        
        // Show success toast using new system BEFORE closing modal
        showEntryUpdated();
        
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
        // Show error toast using new system
        showUpdateFailed(result.error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      
      // Show unexpected error toast using new system
      showUnexpectedError();
    } finally {
      setLoading(false);
    }
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
