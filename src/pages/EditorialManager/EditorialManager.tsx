import { useState, useEffect } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import PermissionGuard from "../../components/auth/PermissionGuard";
import EntryViewModal from "../../components/EditorialManager/EntryViewModal";
import EntryEditModal from "../../components/EditorialManager/EntryEditModal";
import FormFilter from "../../components/EditorialManager/FormFilter";
import EntriesTable from "../../components/EditorialManager/EntriesTable";
import { showToast } from "../../utils/toast";
import { usePaginatedEntries } from "../../components/EditorialManager/pagination";
import { DataSyncProvider } from "../../components/EditorialManager/dataSync";

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FormEntry | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [userId, setUserId] = useState<string>("");

  // Use the new paginated entries hook
  const {
    error,
    refreshEntries
  } = usePaginatedEntries(selectedFormId);

  useEffect(() => {
    checkUserRole();
    loadForms();
  }, []);

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
      // Error handling should be done at component level if needed
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
      // Remove success message clearing - not needed anymore

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

      showToast("Entrada deletada com sucesso!", "success");
      refreshEntries();
    } catch (err) {
      console.error("Error deleting entry:", err);
      showToast("Erro ao deletar entrada", "error");
    }
  };

  const handleEntryUpdated = async () => {
    console.log(`🔄 [EditorialManager] Entry updated, refreshing entries and closing modal`);
    // Toast will be handled by EntryEditModal itself
    refreshEntries();
    setIsEditModalOpen(false);
    console.log(`✅ [EditorialManager] Entry update process completed`);
  };

  const handleCsvImportSuccess = async () => {
    showToast("CSV importado com sucesso!", "success");
    refreshEntries();
  };

  // Get selected form title
  const selectedFormTitle = forms.find(form => form.id === selectedFormId)?.title || "Formulário";

  return (
    <DataSyncProvider>
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

        <div className="mb-6">
          <FormFilter
            forms={forms}
            selectedFormId={selectedFormId}
            onSelectForm={setSelectedFormId}
          />
        </div>

        <EntriesTable
          fields={fields}
          selectedFormId={selectedFormId}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userId={userId}
          onCsvImportSuccess={handleCsvImportSuccess}
          formTitle={selectedFormTitle}
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
    </DataSyncProvider>
  );
}
