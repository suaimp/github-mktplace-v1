import { useState, useEffect } from "react";

import { supabase } from "../../lib/supabase";
import FormEntriesTable from "./FormEntriesTable";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Select from "./Select";
import FormEntriesSkeleton from "./FormEntriesSkeleton";
import * as Fields from "./fields";
import TextArea from "./input/TextArea";

interface FormEntriesRendererProps {
  formId: string;
}

export default function FormEntriesRenderer({
  formId
}: FormEntriesRendererProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [entries, setEntries] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [noDataMessage, setNoDataMessage] = useState("No entries found");
  const [urlFields, setUrlFields] = useState<string[]>([]);
  const [editableFormValues, setEditableFormValues] = useState<
    Record<string, any>
  >({});
  const [entryStatus, setEntryStatus] = useState<string>("em_analise");
  const [note, setNote] = useState("");
  const [fieldSettings, setFieldSettings] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    checkUserType();
    getCurrentUser();
  }, []);

  useEffect(() => {
    loadFormData();
  }, [formId]);

  useEffect(() => {
    if (selectedEntry) {
      setEntryStatus(selectedEntry.status || "em_analise");
      setEditableFormValues(selectedEntry.values || {});
    }
  }, [selectedEntry]);

  async function getCurrentUser() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
      }
    } catch (err) {
      console.error("Error getting current user:", err);
    }
  }

  async function checkUserType() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(!!adminData);
    } catch (err) {
      console.error("Error checking user type:", err);
      setError("Error checking permissions");
    }
  }

  async function loadFormData() {
    try {
      setLoading(true);
      setError("");

      // Load form data first to get no_data_message
      const { data: formData, error: formError } = await supabase
        .from("forms")
        .select("no_data_message")
        .eq("id", formId)
        .single();

      if (formError) throw formError;
      if (formData?.no_data_message) {
        setNoDataMessage(formData.no_data_message);
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

      if (fieldsError) throw fieldsError;

      // Create settings map for all fields
      const settingsMap: Record<string, any> = {};
      fieldsData.forEach((field: any) => {
        if (field.form_field_settings) {
          settingsMap[field.id] = field.form_field_settings;
        }
      });

      setFieldSettings(settingsMap);

      // Filter out fields that should be hidden from entries
      // This includes both hidden fields and admin-only fields for non-admin users
      const visibleFields = (fieldsData || []).filter((field) => {
        const settings = field.form_field_settings;

        // If no settings, show the field
        if (!settings) return true;

        // Hide fields with visibility = 'hidden'
        if (settings.visibility === "hidden") return false;

        // Hide admin-only fields for non-admin users
        if (settings.visibility === "admin" && !isAdmin) return false;

        // Hide marketplace-only fields for non-admin users
        if (settings.visibility === "marketplace" && !isAdmin) return false;

        // Hide button_buy fields in entries table
        if (field.field_type === "button_buy") return false;

        return true;
      });

      setFields(visibleFields);

      // Identify URL fields
      const urlFieldIds = fieldsData
        .filter((field) => field.field_type === "url")
        .map((field) => field.id);

      setUrlFields(urlFieldIds);

      // Load form entries with their values
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
          )
        `
        )
        .eq("form_id", formId)
        .order("created_at", { ascending: false });

      if (entriesError) throw entriesError;

      // Process entries to map values to fields
      const processedEntries = await Promise.all(
        (entriesData || []).map(async (entry: any) => {
          const values: Record<string, any> = {};

          entry.form_entry_values.forEach((value: any) => {
            values[value.field_id] =
              value.value_json !== null ? value.value_json : value.value;
          });

          // Garante que o campo niche sempre exista, mesmo que não venha do backend
          const nicheField = fieldsData.find(
            (f: any) => f.field_type === "niche"
          );
          if (nicheField && !(nicheField.id in values)) {
            values[nicheField.id] = [];
          }

          // Get publisher info if created_by exists
          let publisher = null;
          if (entry.created_by) {
            // First try to get from platform_users
            const { data: platformUserData, error: platformUserError } =
              await supabase
                .from("platform_users")
                .select("first_name, last_name, email")
                .eq("id", entry.created_by)
                .maybeSingle();

            if (!platformUserError && platformUserData) {
              publisher = platformUserData;
            } else {
              // If not found in platform_users, try admins
              const { data: adminData, error: adminError } = await supabase
                .from("admins")
                .select("first_name, last_name, email")
                .eq("id", entry.created_by)
                .maybeSingle();

              if (!adminError && adminData) {
                publisher = adminData;
              }
            }
          }

          return {
            id: entry.id,
            created_at: entry.created_at,
            status: entry.status,
            created_by: entry.created_by,
            publisher,
            values
          };
        })
      );

      setEntries(processedEntries);
    } catch (err) {
      console.error("Error loading form data:", err);
      setError("Error loading form data");
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
    try {
      setLoading(true);
      setError("");

      const { error: deleteError } = await supabase
        .from("form_entries")
        .delete()
        .eq("id", entryId);

      if (deleteError) throw deleteError;

      // Reload entries after deletion
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
      return "This field is required";
    }

    if (!value) return null;

    switch (field.field_type) {
      case "email":
        if (!value.includes("@")) {
          return "Please enter a valid email address with @";
        }
        break;

      case "url":
        try {
          new URL(value);
        } catch {
          return "Please enter a valid URL";
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
          return `You can select up to ${settings.max_selections} options`;
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
    if (!selectedEntry) return;

    try {
      setLoading(true);
      setError("");
      setValidationErrors({});

      // Validate all fields
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

      // Update entry status
      const { error: updateError } = await supabase
        .from("form_entries")
        .update({
          status: entryStatus
        })
        .eq("id", selectedEntry.id);

      if (updateError) throw updateError;

      // Update entry values
      const updatedValues: Array<{
        entry_id: any;
        field_id: string;
        value: string | null;
        value_json: any;
        niches: any;
      }> = [];
      for (const [fieldId, value] of Object.entries(editableFormValues)) {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) continue;

        // Identifica se é campo do tipo "niche"
        const isNicheValue = field.field_type === "niche";
        // Determina se deve salvar em value ou value_json
        const isJsonValue = typeof value !== "string";

        updatedValues.push({
          entry_id: selectedEntry.id,
          field_id: fieldId,
          value: !isNicheValue && !isJsonValue ? value : null,
          value_json: !isNicheValue && isJsonValue ? value : null,
          niches: isNicheValue ? value : null
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
        const {
          data: { user }
        } = await supabase.auth.getUser();

        const { error: noteError } = await supabase
          .from("form_entry_notes")
          .insert([
            {
              entry_id: selectedEntry.id,
              note: note.trim(),
              created_by: user?.id
            }
          ]);

        if (noteError) throw noteError;
      }

      // Reload entries after update
      await loadFormData();
      setIsEditModalOpen(false);
      setNote("");
    } catch (err) {
      console.error("Error updating entry:", err);
      setError("Error updating entry");
    } finally {
      setLoading(false);
    }
  };

  // Render field editor based on field type
  const renderFieldEditor = (field: any) => {
    const settings = fieldSettings[field.id] || {};
    const value = editableFormValues[field.id];
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
      setEditableFormValues((prev) => ({
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
    // Log para depuração do valor passado para o campo
    console.log(
      "[FormEntriesRenderer] field:",
      field.label,
      "type:",
      field.field_type,
      "value:",
      value
    );

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

    // Return original field type for standard fields
    return fieldType;
  };

  if (loading) {
    return <FormEntriesSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-center text-error-500">{error}</div>;
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
      <FormEntriesTable
        entries={entries}
        fields={fields}
        urlFields={urlFields}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
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
              Editar Entrada
            </h4>
          </div>

          {selectedEntry && (
            <div className="space-y-6">
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                  Dados do Formulário
                </h5>

                <div className="grid grid-cols-1 gap-6">
                  {fields.map((field) => renderFieldEditor(field))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                  Status
                </h5>

                <Select
                  options={[
                    { value: "em_analise", label: "Análise" },
                    { value: "verificado", label: "Verificado" },
                    { value: "reprovado", label: "Reprovado" }
                  ]}
                  value={entryStatus}
                  onChange={(value) => setEntryStatus(value)}
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
