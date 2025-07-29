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
      refreshEntries(); // Use the new refresh function
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const handleEditSave = () => {
    // Toast will be handled by EntryEditModal itself
    setIsEditModalOpen(false);
    refreshEntries(); // Use the new refresh function
  };

  const handleCsvImportSuccess = () => {
    showToast("CSV importado com sucesso!", "success");
    refreshEntries(); // Use the new refresh function
  };

  // Get form title for the selected form
  const selectedForm = forms.find((form) => form.id === selectedFormId);
  const formTitle = selectedForm?.title || "Formulário";

  return (
    <>
      <PageMeta
        title="Editorial Manager | Marketplace Admin"
        description="Manage marketplace entries and content"
      />

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          <PageBreadcrumb pageTitle="Editorial Manager" />

          {error && (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm dark:bg-gray-900">
            <div className="p-6">
              <FormFilter
                forms={forms}
                selectedFormId={selectedFormId}
                onSelectForm={setSelectedFormId}
              />

              <div className="mt-6">
                <PermissionGuard permission="admin">
                  <EntriesTable
                    fields={fields}
                    selectedFormId={selectedFormId}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    userId={userId}
                    onCsvImportSuccess={handleCsvImportSuccess}
                    formTitle={formTitle}
                  />
                </PermissionGuard>

                <PermissionGuard permission="publisher" fallback={null}>
                  <EntriesTable
                    fields={fields}
                    selectedFormId={selectedFormId}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    show={!isAdmin}
                    userId={userId}
                    onCsvImportSuccess={handleCsvImportSuccess}
                    formTitle={formTitle}
                  />
                </PermissionGuard>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <EntryViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        entry={selectedEntry}
        isAdmin={isAdmin}
      />

      {/* Edit Modal */}
      <EntryEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entry={selectedEntry}
        onSave={handleEditSave}
        isAdmin={isAdmin}
      />
    </>
  );
}
