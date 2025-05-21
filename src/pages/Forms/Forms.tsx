import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell
} from "../../components/ui/table/index";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { PencilIcon, TrashBinIcon, SettingsIcon } from "../../icons";
import PermissionGuard from "../../components/auth/PermissionGuard";
import FormShortcodes from "../../components/form/FormShortcodes";

interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  validation_rules: Record<string, any>;
  success_message: string | null;
  failure_message: string | null;
  submit_button_text: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

interface FormField {
  id: string;
  field_type: string;
  label: string;
  description?: string;
  placeholder?: string;
  default_value?: string;
  options?: any[];
  validation_rules?: Record<string, any>;
  is_required: boolean;
  position: number;
  width: "full" | "half" | "third" | "quarter";
  css_class?: string;
}

interface ValidationErrors {
  title?: string;
}

export default function Forms() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [newFormTitle, setNewFormTitle] = useState("");
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isShortcodesOpen, setIsShortcodesOpen] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      setLoading(true);
      setError("");

      const { data: forms, error } = await supabase
        .from("forms")
        .select("*, fields:form_fields(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setForms(forms || []);
    } catch (err) {
      console.error("Error loading forms:", err);
      setError("Error loading form list");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = () => {
    setNewFormTitle("");
    setValidationErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate title
      if (!newFormTitle.trim()) {
        setValidationErrors({ title: "Title is required" });
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create new form
      const { data: form, error: createError } = await supabase
        .from("forms")
        .insert([
          {
            title: newFormTitle.trim(),
            fields: [],
            validation_rules: {},
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      if (!form) throw new Error("Form not created");

      setIsCreateModalOpen(false);
      navigate(`/forms/edit/${form.id}`);
    } catch (err) {
      console.error("Error creating form:", err);
      setError("Error creating form");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (form: Form) => {
    navigate(`/forms/edit/${form.id}`);
  };

  const handleDelete = async (formId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this form? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase.from("forms").delete().eq("id", formId);

      if (error) throw error;

      setSuccess("Form deleted successfully");
      await loadForms();
    } catch (err) {
      console.error("Error deleting form:", err);
      setError("Error deleting form");
    } finally {
      setLoading(false);
    }
  };

  const handleShowShortcodes = (form: Form) => {
    setSelectedForm(form);
    setIsShortcodesOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading && !forms.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <PermissionGuard
      permission="forms.view"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-error-500">Access not authorized</div>
        </div>
      }
    >
      <PageMeta title="Forms | Admin Panel" description="Manage system forms" />
      <PageBreadcrumb pageTitle="Forms" />

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
        <Button onClick={handleCreate}>New Form</Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Fields
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Last Update
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {form.title}
                      </span>
                      {form.description && (
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {form.description}
                        </span>
                      )}
                      <button
                        onClick={() => handleShowShortcodes(form)}
                        className="mt-2 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Ver Shortcodes
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {form.fields?.length || 0} campos
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        color={
                          form.status === "published"
                            ? "success"
                            : form.status === "archived"
                            ? "error"
                            : "warning"
                        }
                      >
                        {form.status === "published"
                          ? "Published"
                          : form.status === "archived"
                          ? "Archived"
                          : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(form.updated_at)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(form)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/forms/settings/${form.id}`)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Settings"
                        >
                          <SettingsIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                          title="Delete"
                        >
                          <TrashBinIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {forms.length === 0 && (
                  <TableRow>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        className="max-w-[500px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              New Form
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter a name for your new form
            </p>
          </div>

          <form onSubmit={handleCreateSubmit}>
            <div className="mb-6">
              <Label>
                Form Title <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                value={newFormTitle}
                onChange={(e) => {
                  setNewFormTitle(e.target.value);
                  if (validationErrors.title) {
                    setValidationErrors({});
                  }
                }}
                error={!!validationErrors.title}
                hint={validationErrors.title}
                placeholder="Enter form title"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Shortcodes Modal */}
      <Modal
        isOpen={isShortcodesOpen}
        onClose={() => setIsShortcodesOpen(false)}
        className="max-w-[700px] m-4"
      >
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Shortcodes
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Use estes shortcodes para inserir o formulário ou sua listagem em
              páginas
            </p>
          </div>

          {selectedForm && <FormShortcodes formId={selectedForm.id} />}

          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setIsShortcodesOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </PermissionGuard>
  );
}
