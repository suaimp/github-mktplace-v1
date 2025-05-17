import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/button/Button";
import FormFieldSidebar from "../../components/form/FormFieldSidebar";
import FormField from "../../components/form/FormField";
import FormShortcode from "../../components/form/FormShortcode";
import Select from "../../components/form/Select";
import * as Icons from "../../icons";

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

export default function EditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [showShortcode, setShowShortcode] = useState(false);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  async function loadForm() {
    try {
      setLoading(true);
      setError("");

      // Load form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (formError) throw formError;

      // Load form fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', id)
        .order('position', { ascending: true });

      if (fieldsError) throw fieldsError;

      setForm(formData);
      setFields(fieldsData || []);
      setStatus(formData.status);
      
    } catch (err) {
      console.error('Error loading form:', err);
      setError('Error loading form');
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Update form status
      const { error: updateError } = await supabase
        .from('forms')
        .update({
          status,
          updated_by: user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSuccess("Form saved successfully");
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error('Error saving form:', err);
      setError('Error saving form');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async (fieldType: string) => {
    if (!form) return;

    try {
      setLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get next position
      const nextPosition = fields.length > 0 
        ? Math.max(...fields.map(f => f.position)) + 1 
        : 0;

      // Create new field
      const { data: newField, error: createError } = await supabase
        .from('form_fields')
        .insert([{
          form_id: form.id,
          field_type: fieldType,
          label: `New ${fieldType} field`,
          position: nextPosition,
          is_required: false,
          width: 'full',
          created_by: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Update local state
      setFields(prev => [...prev, newField]);

    } catch (err) {
      console.error('Error adding field:', err);
      setError('Error adding field');
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = async (updatedField: FormField) => {
    try {
      setLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Update field in database
      const { error: updateError } = await supabase
        .from('form_fields')
        .update({
          ...updatedField,
          updated_by: user.id
        })
        .eq('id', updatedField.id);

      if (updateError) throw updateError;

      // Update local state
      setFields(prev => prev.map(field => 
        field.id === updatedField.id ? updatedField : field
      ));

    } catch (err) {
      console.error('Error updating field:', err);
      setError('Error updating field');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this field? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Delete field from database
      const { error: deleteError } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId);

      if (deleteError) throw deleteError;

      // Update local state
      setFields(prev => prev.filter(field => field.id !== fieldId));

    } catch (err) {
      console.error('Error deleting field:', err);
      setError('Error deleting field');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveField = async (dragIndex: number, hoverIndex: number) => {
    try {
      const dragField = fields[dragIndex];
      const hoverField = fields[hoverIndex];
      
      // Update local state immediately for smooth UI
      const newFields = [...fields];
      newFields[dragIndex] = hoverField;
      newFields[hoverIndex] = dragField;
      setFields(newFields);

      // Update positions in database
      const updates = [
        { 
          id: dragField.id,
          position: hoverIndex,
          field_type: dragField.field_type,
          label: dragField.label,
          is_required: dragField.is_required,
          width: dragField.width
        },
        { 
          id: hoverField.id,
          position: dragIndex,
          field_type: hoverField.field_type,
          label: hoverField.label,
          is_required: hoverField.is_required,
          width: hoverField.width
        }
      ];

      const { error } = await supabase
        .from('form_fields')
        .upsert(updates);

      if (error) throw error;

    } catch (err) {
      console.error('Error updating field positions:', err);
      setError('Error updating field positions');
      // Revert local state on error
      setFields(fields);
    }
  };

  const handleViewForm = () => {
    if (!form) return;
    window.open(`/forms/preview/${form.id}`, '_blank');
  };

  if (loading && !form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">Form not found</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <PageMeta
        title={`Edit Form: ${form.title} | Admin Panel`}
        description="Edit form fields and settings"
      />
      <div className="form-editor-layout">
        <div className="form-editor-main">
          <div className="form-editor-content p-4 md:p-6">
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

            <div className="form_editor_fields_container">
              {fields.length > 0 ? (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      field={field}
                      index={index}
                      moveField={handleMoveField}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                    />
                  ))}
                </div>
              ) : (
                <div className="form_editor_fields_no_fields">
                  <div className="dropzone__target">
                    <div className="dropzone__placeholder">
                      <img
                        src="/images/error/maintenance.svg"
                        alt="No fields"
                        className="gform-editor__no-fields-graphic dark:hidden"
                      />
                      <img
                        src="/images/error/maintenance-dark.svg"
                        alt="No fields"
                        className="gform-editor__no-fields-graphic hidden dark:block"
                      />
                      <p className="text-gray-500 dark:text-gray-400">
                        Arraste campos aqui ou use o menu lateral para adicionar campos ao seu formulário
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-editor-sidebar">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {form.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Select
                    options={[
                      { value: "draft", label: "Rascunho" },
                      { value: "published", label: "Publicado" },
                      { value: "archived", label: "Arquivado" }
                    ]}
                    value={status}
                    onChange={(value) => setStatus(value as "draft" | "published" | "archived")}
                  />
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowShortcode(!showShortcode)}
                    className="w-full"
                  >
                    <Icons.CodeIcon className="w-5 h-5 mr-2" />
                    Shortcode
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleViewForm}
                    className="w-full"
                  >
                    <Icons.EyeIcon className="w-5 h-5 mr-2" />
                    Visualizar
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/forms/settings/${form.id}`)}
                  className="w-full"
                >
                  <Icons.SettingsIcon className="w-5 h-5 mr-2" />
                  Configurações
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/forms')}
                  className="w-full"
                >
                  <Icons.ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>

            {showShortcode && (
              <div className="mt-4">
                <FormShortcode formId={form.id} />
              </div>
            )}
          </div>

          <FormFieldSidebar onAddField={handleAddField} />
        </div>
      </div>
    </DndProvider>
  );
}