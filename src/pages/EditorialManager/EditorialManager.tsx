import { useState, useEffect } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import PermissionGuard from "../../components/auth/PermissionGuard";
import EntryViewModal from "../../components/EditorialManager/EntryViewModal";
import EntryEditModal from "../../components/EditorialManager/EntryEditModal";
import FormFilter from "../../components/EditorialManager/FormFilter";
import EntriesTable from "../../components/EditorialManager/EntriesTable";
import { processEntryValues } from "../../components/EditorialManager/actions/valuePriceProcessor";
import ImportCsvField from "../../components/form/fields/ImportCsvField";

interface FormEntry {
  id: string;
  form_id: string;
  status: string;
  created_at: string;
  created_by: string | null;
  form: {
    title: string;
  };
  values: Record<string, any>;
  publisher?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  fields: any[];
  notes: {
    id: string;
    note: string;
    created_at: string;
    created_by: string | null;
  }[];
}

interface FormField {
  id: string;
  field_type: string;
  label: string;
  description?: string;
  is_required?: boolean;
  position?: number;
  width?: string;
  options?: any[];
  form_field_settings?: {
    no_duplicates?: boolean;
    field_identifier?: string;
    visibility?: string;
    show_percentage?: boolean;
  } | null;
}

interface Form {
  id: string;
  title: string;
}

export default function EditorialManager() {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    checkUserRole();
    loadForms();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [selectedFormId]);

  useEffect(() => {
    if (selectedFormId) {
      loadFormFields(selectedFormId);
    }
  }, [selectedFormId]);

  async function checkUserRole() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Set userId for CSV import
      setUserId(user.id);

      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(!!adminData);
    } catch (err) {
      console.error("Error checking user role:", err);
    }
  }

  async function loadForms() {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("id, title")
        .order("title", { ascending: true });

      if (error) throw error;
      setForms(data || []);

      // Set the first form as selected by default if available
      if (data && data.length > 0) {
        setSelectedFormId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading forms:", err);
      setError("Erro ao carregar formulários");
    }
  }

  async function loadFormFields(formId: string) {
    try {
      const { data, error } = await supabase
        .from("form_fields")
        .select(
          `
          *,
          form_field_settings (
            no_duplicates,
            field_identifier,
            visibility,
            show_percentage
          )
        `
        )
        .eq("form_id", formId)
        .order("position", { ascending: true });

      if (error) throw error;
      setFields(data || []);
    } catch (err) {
      console.error("Error loading form fields:", err);
    }
  }

  async function loadEntries() {
    try {
      setLoading(true);
      setError("");

      // Build the query
      let query = supabase
        .from("form_entries")
        .select(
          `
          id,
          form_id,
          status,
          created_at,
          created_by,
          form:forms(title),
          values:form_entry_values(
            field_id,
            value,
            value_json
          ),
          notes:form_entry_notes(
            id,
            note,
            created_at,
            created_by
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply form filter if selected
      if (selectedFormId) {
        query = query.eq("form_id", selectedFormId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process entries to format values
      const processedEntries = await Promise.all(
        (data || []).map(async (entry: any) => {
          // Usa a lógica extraída para processar os valores
          const values = await processEntryValues(entry.values);

          // Get publisher info if created_by exists
          let publisher: any = null;
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
            form_id: entry.form_id,
            created_at: entry.created_at,
            status: entry.status,
            created_by: entry.created_by,
            publisher,
            values,
            form: entry.form,
            notes: entry.notes || [],
            fields: [] // Corrigido: garantir compatibilidade com FormEntry
          };
        })
      );

      setEntries(processedEntries);
    } catch (err) {
      console.error("Error loading entries:", err);
      setError("Erro ao carregar entradas");
    } finally {
      setLoading(false);
    }
  }

  const handleView = (entry: FormEntry) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  const handleEdit = (entry: FormEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this entry? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // First, update cart_checkout_resume records to remove the reference
      const { error: updateCartError } = await supabase
        .from("cart_checkout_resume")
        .update({ entry_id: null })
        .eq("entry_id", entryId);

      if (updateCartError) {
        console.error("Error updating cart_checkout_resume:", updateCartError);
        throw updateCartError;
      }

      // Then delete the form entry
      const { error: deleteError } = await supabase
        .from("form_entries")
        .delete()
        .eq("id", entryId);

      if (deleteError) throw deleteError;

      setSuccess("Entry deleted successfully");
      await loadEntries();
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError("Error deleting entry");
    } finally {
      setLoading(false);
    }
  };

  const handleEntryUpdated = async () => {
    setSuccess("Entry updated successfully");
    await loadEntries();
    setIsEditModalOpen(false);
  };

  const handleCsvImportSuccess = async () => {
    setSuccess("CSV importado com sucesso!");
    await loadEntries();
  };

  return (
    <PermissionGuard
      permission="forms.entries.view"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Acesso não autorizado</div>
        </div>
      }
    >
      <PageMeta
        title="Gerenciador Editorial | Painel Admin"
        description="Gerenciamento de entradas de formulários"
      />
      <PageBreadcrumb pageTitle="Gerenciador Editorial" />

      {error && (
        <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          {success}
        </div>
      )}

      <div className="mb-6">
        <FormFilter
          forms={forms}
          selectedFormId={selectedFormId}
          onSelectForm={setSelectedFormId}
        />
      </div>

      {/* CSV Import Section */}
      {selectedFormId && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Importar CSV
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Faça upload de um arquivo CSV para importar múltiplas entradas
            </span>
          </div>
          <ImportCsvField
            field={{ id: "csv-import", label: "Arquivo CSV" }}
            value={csvFile}
            onChange={setCsvFile}
            formFields={fields}
            formId={selectedFormId}
            userId={userId}
            onSuccess={handleCsvImportSuccess}
          />
        </div>
      )}

      <EntriesTable
        entries={entries}
        fields={fields}
        loading={loading}
        selectedFormId={selectedFormId}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* View Entry Modal */}
      {selectedEntry && (
        <EntryViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          entry={{ ...selectedEntry, form_id: selectedEntry.form_id }}
          isAdmin={isAdmin}
        />
      )}

      {/* Edit Entry Modal */}
      {selectedEntry && (
        <EntryEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          entry={{ ...selectedEntry, form_id: selectedEntry.form_id }}
          onSave={handleEntryUpdated}
          isAdmin={isAdmin}
        />
      )}
    </PermissionGuard>
  );
}
