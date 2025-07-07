import { useState, useEffect } from "react";

import { supabase } from "../../lib/supabase";
import FormEntriesTable from "./FormEntriesTable";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import FormEntriesSkeleton from "./FormEntriesSkeleton";
import * as FieldsImport from "./fields";
import TextArea from "./input/TextArea";
import { getCommissionField } from "../../services/db-services/form-services/formFieldsService";
import { applyCommissionToFormValues } from "../EditorialManager/actions/commissionLogic";
import {
  filterFieldsForTable,
  filterVisibleFields,
  getUrlFields,
  createFieldSettingsMap,
  shouldShowFieldInEdit,
} from "./actions/userFormEntriesActions";

const Fields = FieldsImport as Record<string, React.ComponentType<any>>;

interface UserFormEntriesRendererProps {
  formId: string;
  show?: boolean;
}

interface Publisher {
  first_name: string;
  last_name: string;
  email: string;
}

export default function UserFormEntriesRenderer({
  formId,
  show = true,
}: UserFormEntriesRendererProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [allFields, setAllFields] = useState<any[]>([]); // Todos os campos, incluindo ocultos
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState(
    "Você ainda não enviou nenhuma entrada para este formulário"
  );
  const [urlFields, setUrlFields] = useState<string[]>([]);
  const [editableFormValues, setEditableFormValues] = useState<
    Record<string, any>
  >({});
  const [note, setNote] = useState("");
  const [fieldSettings, setFieldSettings] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formTitle, setFormTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFormData();
      checkUserRole();
    } else {
      setLoading(false);
    }
  }, [formId, currentUser]);

  useEffect(() => {
    if (selectedEntry) {
      setEditableFormValues(selectedEntry.values || {});
    }
  }, [selectedEntry]);

  async function getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      } else {
        setError("");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error getting current user:", err);
      setError("Erro ao verificar usuário");
      setLoading(false);
    }
  }

  async function checkUserRole() {
    try {
      if (!currentUser) return;

      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", currentUser.id)
        .maybeSingle();

      setIsAdmin(!!adminData);
    } catch (err) {
      console.error("Error checking user role:", err);
    }
  }

  async function loadFormData() {
    if (!currentUser || !formId) return;

    try {
      setLoading(true);
      setError("");

      // Load form data first to get no_data_message
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("no_data_message, title")
        .eq("id", formId)
        .single();

      if (formError) throw formError;
      if (formData?.no_data_message) {
        setNoDataMessage(formData.no_data_message);
      }
      if (formData?.title) {
        setFormTitle(formData.title);
      }

      // Load form fields with settings
      const { data: fieldsData, error: fieldsError } = await supabase
        .from("form_fields")
        .select(
          `
          *,
          form_field_settings (*)
        `
        )
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (fieldsError) throw fieldsError; // Create settings map for all fields
      const settingsMap = createFieldSettingsMap(fieldsData);
      setFieldSettings(settingsMap);

      // Filter visible fields based on visibility settings and user role
      const visibleFields = filterVisibleFields(fieldsData || [], isAdmin);

      // Filter fields specifically for table display (only URL fields + auto-generated columns)
      const tableFields = filterFieldsForTable(visibleFields);

      // Para cálculos, incluir todos os campos (incluindo comissão) mesmo que não sejam visíveis
      const allFieldsForCalculation = fieldsData || [];

      setFields(tableFields); // Apenas campos necessários para a tabela

      // Armazenar todos os campos para uso nos cálculos e edição
      setAllFields(allFieldsForCalculation);

      // Identify URL fields
      const urlFieldIds = getUrlFields(fieldsData || []);
      setUrlFields(urlFieldIds);

      // Load form entries with their values - ONLY FOR CURRENT USER
      const { data: entriesData, error: entriesError } = await supabase
        .from("form_entries")
        .select(
          `
          id,
          created_at,
          status,
          created_by,
          form_entry_values (
            field_id,
            value,
            value_json
          ),
          notes:form_entry_notes(
            id,
            note,
            created_at,
            created_by,
            type
          )
        `
        )
        .eq("form_id", formId)
        .eq("created_by", currentUser.id)
        .order("created_at", { ascending: false });

      if (entriesError) throw entriesError;

      // Process entries to map values to fields
      const processedEntries = await Promise.all(
        (entriesData || []).map(async (entry: any) => {
          const values: Record<string, any> = {};
          entry.form_entry_values.forEach((value: any) => {
            let fieldValue;
            if (value.value_json !== null) {
              fieldValue = value.value_json;
            } else {
              // Verifica se value.value contém um objeto com promotional_price
              try {
                const parsedValue = JSON.parse(value.value);
                if (
                  parsedValue &&
                  typeof parsedValue === "object" &&
                  parsedValue.promotional_price
                ) {
                  // Verifica se é um campo de produto para retornar o objeto completo
                  const field = fieldsData.find(
                    (f: any) => f.id === value.field_id
                  );
                  if (field && field.field_type === "product") {
                    // Para campos de produto, retorna o objeto completo para preservar ambos os valores
                    fieldValue = parsedValue;
                  } else {
                    // Para outros campos, retorna apenas o promotional_price
                    fieldValue = parsedValue.promotional_price;
                  }
                } else {
                  fieldValue = value.value;
                }
              } catch {
                // Se não conseguir fazer parse, usa o valor original
                fieldValue = value.value;
              }
            }
            // Se for campo niche, garantir array de objetos
            const field = fieldsData.find((f: any) => f.id === value.field_id);
            if (field && field.field_type === "niche") {
              if (!Array.isArray(fieldValue)) {
                fieldValue = [];
              } else {
                fieldValue = fieldValue.map((n: any) => {
                  if (typeof n === "string") return { niche: n, price: "" };
                  if (typeof n === "object" && n !== null && !("price" in n))
                    return { ...n, price: "" };
                  return n;
                });
              }
            }
            values[value.field_id] = fieldValue;
          });

          // Garante que o campo niche sempre exista, mesmo que não venha do backend
          const nicheField = fieldsData.find(
            (f: any) => f.field_type === "niche"
          );
          if (nicheField && !(nicheField.id in values)) {
            values[nicheField.id] = [];
          } // Get publisher info
          let publisher: Publisher | null = null;

          // First try to get from platform_users
          const { data: platformUserData, error: platformUserError } =
            await supabase
              .from("platform_users")
              .select("first_name, last_name, email")
              .eq("id", currentUser.id)
              .maybeSingle();

          if (!platformUserError && platformUserData) {
            publisher = platformUserData;
          } else {
            // If not found in platform_users, try admins
            const { data: adminData, error: adminError } = await supabase
              .from("admins")
              .select("first_name, last_name, email")
              .eq("id", currentUser.id)
              .maybeSingle();

            if (!adminError && adminData) {
              publisher = adminData;
            }
          }

          return {
            id: entry.id,
            created_at: entry.created_at,
            status: entry.status,
            created_by: entry.created_by,
            publisher,
            values,
            notes: entry.notes || [],
          };
        })
      );

      setEntries(processedEntries);
    } catch (err) {
      console.error("Error loading form data:", err);
      setError("Erro ao carregar dados do formulário");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry);
    setEditableFormValues({ ...entry.values });
    setValidationErrors({});
    setIsEditModalOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { error } = await supabase
        .from("form_entries")
        .delete()
        .eq("id", entryId)
        .eq("created_by", currentUser.id); // Ensure only the owner can delete

      if (error) throw error;

      await loadFormData();
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError("Error deleting entry");
    } finally {
      setLoading(false);
    }
  };

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

      case "commission":
        const commission = parseFloat(value);
        if (isNaN(commission) || commission < 0 || commission > 1000) {
          return "Commission must be between 0 and 1000";
        }
        break;
    }

    return null;
  };
  const handleSaveEdit = async () => {
    if (!selectedEntry || !currentUser) return;

    try {
      setLoading(true);
      setError("");
      setValidationErrors({});

      // Buscar o field_id do campo de comissão
      const commissionField = await getCommissionField();
      const commissionFieldId = commissionField?.id;

      console.log("🔍 [DEBUG] Commission Field:", commissionField);
      console.log("🆔 [DEBUG] Commission Field ID:", commissionFieldId);

      // Validate all visible fields
      const errors: Record<string, string> = {};
      fields.forEach((field) => {
        const error = validateField(field, editableFormValues[field.id]);
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

      // Verify this entry belongs to the current user
      const { data: entryData, error: entryCheckError } = await supabase
        .from("form_entries")
        .select("created_by")
        .eq("id", selectedEntry.id)
        .single();

      if (entryCheckError) throw entryCheckError;

      if (entryData.created_by !== currentUser.id) {
        throw new Error("Você só pode editar suas próprias entradas");
      }

      // Carregar todos os valores originais da entrada para garantir que temos o valor da comissão
      const { data: allEntryValues, error: allValuesError } = await supabase
        .from("form_entry_values")
        .select("field_id, value, value_json")
        .eq("entry_id", selectedEntry.id);

      if (allValuesError) throw allValuesError;

      // Criar um objeto com todos os valores originais
      const allOriginalValues: Record<string, any> = {};
      allEntryValues.forEach((entryValue: any) => {
        let fieldValue;
        if (entryValue.value_json !== null) {
          fieldValue = entryValue.value_json;
        } else {
          fieldValue = entryValue.value;
        }
        allOriginalValues[entryValue.field_id] = fieldValue;
      });

      console.log("📄 [DEBUG] All original values:", allOriginalValues);
      console.log("✏️ [DEBUG] Editable form values:", editableFormValues);

      // Combinar valores editados com valores originais (priorizando editados)
      const completeFormValues = {
        ...allOriginalValues,
        ...editableFormValues,
      };

      console.log(
        "🔗 [DEBUG] Complete form values before commission:",
        completeFormValues
      );

      if (commissionFieldId && completeFormValues[commissionFieldId]) {
        console.log(
          "💰 [DEBUG] Commission value found:",
          completeFormValues[commissionFieldId]
        );
      } else {
        console.log(
          "❌ [DEBUG] Commission value NOT found or commissionFieldId is null"
        );
      }

      // Aplicar comissão aos valores usando a função do commissionLogic
      const formValuesWithCommission = applyCommissionToFormValues(
        completeFormValues,
        commissionFieldId || null
      );

      console.log(
        "✅ [DEBUG] Form values WITH commission:",
        formValuesWithCommission
      );

      // Update entry values
      interface FormEntryValue {
        entry_id: string;
        field_id: string;
        value: string | null;
        value_json: any;
      }

      const updatedValues: FormEntryValue[] = [];
      for (const [fieldId, value] of Object.entries(formValuesWithCommission)) {
        // Procurar o campo em todos os campos (incluindo ocultos)
        const field = allFields.find((f) => f.id === fieldId);
        if (!field) continue;

        // Determine if value should be stored in value or value_json
        const isJsonValue = typeof value !== "string";

        updatedValues.push({
          entry_id: selectedEntry.id,
          field_id: fieldId,
          value: isJsonValue ? null : value,
          value_json: isJsonValue ? value : null,
        });
      }

      // Delete existing values
      const { error: deleteError } = await supabase
        .from("form_entry_values")
        .delete()
        .eq("entry_id", selectedEntry.id);

      if (deleteError) throw deleteError;

      // Insert new values
      const { error: insertError } = await supabase
        .from("form_entry_values")
        .insert(updatedValues);

      if (insertError) throw insertError;

      // Add note if provided
      if (note.trim()) {
        const { error: noteError } = await supabase
          .from("form_entry_notes")
          .insert([
            {
              entry_id: selectedEntry.id,
              note: note.trim(),
              created_by: currentUser.id,
            },
          ]);

        if (noteError) throw noteError;
      }

      // Reload entries after update
      await loadFormData();
      setIsEditModalOpen(false);
      setNote("");
    } catch (err: any) {
      console.error("Error updating entry:", err);
      setError(err.message || "Erro ao atualizar entrada");
    } finally {
      setLoading(false);
    }
  };
  // Render field editor based on field type
  // renderiza dinamicamente cada campo do formulário
  const renderFieldEditor = (field: any) => {
    const settings = fieldSettings[field.id] || {};
    const value = editableFormValues[field.id];
    const error = validationErrors[field.id];

    // Não exibir campos marketplace
    if (settings.visibility === "marketplace") {
      return null;
    }

    // Skip fields that shouldn't be shown in edit mode
    if (!shouldShowFieldInEdit(field, isAdmin)) {
      return null;
    }

    const handleChange = (newValue: any) => {
      setEditableFormValues((prev) => ({
        ...prev,
        [field.id]: newValue,
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

    //os valores dos inputs e checkboxes vem em value.
    //
    const fieldProps = {
      field,
      settings,
      value,
      onChange: handleChange,
      error,
      onErrorClear: handleErrorClear,
    };

    // Get the appropriate field component based on field type
    const fieldTypeMapped = mapFieldType(field.field_type);

    // Debug: log valor enviado para NicheField
    if (fieldTypeMapped === "niche") {
      console.log(
        "[UserFormEntriesRenderer] Valor enviado para NicheField:",
        value
      );
    }

    // Log para depuração do valor enviado para o campo
    console.log("[UserFormEntriesRenderer] fieldProps.value:", value);

    const FieldComponent = (Fields as Record<string, React.ComponentType<any>>)[
      `${
        fieldTypeMapped.charAt(0).toUpperCase() + fieldTypeMapped.slice(1)
      }Field`
    ];

    if (!FieldComponent) {
      return (
        <div className="text-error-500">
          Tipo de campo desconhecido: {field.field_type}
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
      "google_traffic",
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
    } // Map button_buy field to use ButtonBuyField component
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

  if (loading) {
    return <FormEntriesSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-center text-error-500">{error}</div>;
  }

  if (!currentUser) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Você precisa estar logado para ver suas entradas
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        {noDataMessage}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Suas entradas para: {formTitle}
      </h3>

      <FormEntriesTable
        entries={entries}
        fields={fields}
        urlFields={urlFields}
        onEdit={handleEdit}
        onDelete={handleDelete}
        show={show}
      />

      {/* Edit Entry Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-[800px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Editar Entradas
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formTitle}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
              {error}
            </div>
          )}

          {selectedEntry && (
            <div className="space-y-6">
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                  Dados do Formulário
                </h5>{" "}
                <div className="grid grid-cols-1 gap-6">
                  {allFields
                    .filter((field) => shouldShowFieldInEdit(field, isAdmin))
                    .map((field) => renderFieldEditor(field))}
                </div>
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

              {selectedEntry.notes && selectedEntry.notes.length > 0 && (
                <div>
                  <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                    Notas
                  </h5>
                  <div className="space-y-3">
                    {selectedEntry.notes.map((note: any) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {note.note}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(note.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
