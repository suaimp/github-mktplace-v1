import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';

interface Form {
  id: string;
  title: string;
  description: string | null;
  submit_button_text: string | null;
  success_message: string | null;
  failure_message: string | null;
  redirect_page: string | null;
  no_data_message: string | null;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function FormSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState({
    title: "",
    description: "",
    submit_button_text: "Enviar",
    success_message: "",
    failure_message: "",
    redirect_page: "",
    no_data_message: "Nenhum registro encontrado"
  });

  useEffect(() => {
    if (id) {
      loadFormSettings();
      loadPages();
    }
  }, [id]);

  async function loadPages() {
    try {
      const { data: pages, error } = await supabase
        .from('pages')
        .select('id, title, slug, status')
        .eq('status', 'published')
        .order('title', { ascending: true });

      if (error) throw error;
      setPages(pages || []);
    } catch (err) {
      console.error('Error loading pages:', err);
    }
  }

  async function loadFormSettings() {
    try {
      setLoading(true);
      setError("");

      const { data: form, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (form) {
        setSettings({
          title: form.title || "",
          description: form.description || "",
          submit_button_text: form.submit_button_text || "Enviar",
          success_message: form.success_message || "",
          failure_message: form.failure_message || "",
          redirect_page: form.redirect_page || "",
          no_data_message: form.no_data_message || "Nenhum registro encontrado"
        });
      }
      
    } catch (err) {
      console.error('Error loading form settings:', err);
      setError('Error loading form settings');
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: updateError } = await supabase
        .from('forms')
        .update({
          title: settings.title.trim(),
          description: settings.description.trim() || null,
          submit_button_text: settings.submit_button_text.trim(),
          success_message: settings.success_message.trim() || null,
          failure_message: settings.failure_message.trim() || null,
          redirect_page: settings.redirect_page || null,
          no_data_message: settings.no_data_message.trim() || "Nenhum registro encontrado",
          updated_by: user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate(`/forms/edit/${id}`);
      }, 1500);

    } catch (err) {
      console.error('Error saving form settings:', err);
      setError('Error saving form settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.title) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Form Settings | Admin Panel"
        description="Configure form settings"
      />
      <PageBreadcrumb pageTitle="Form Settings" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {error && (
          <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <Label>Form Title</Label>
            <Input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              type="text"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Submit Button Text</Label>
            <Input
              type="text"
              value={settings.submit_button_text}
              onChange={(e) => setSettings({ ...settings, submit_button_text: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Success Message</Label>
            <Input
              type="text"
              value={settings.success_message}
              onChange={(e) => setSettings({ ...settings, success_message: e.target.value })}
              placeholder="Form submitted successfully!"
            />
          </div>

          <div>
            <Label>Error Message</Label>
            <Input
              type="text"
              value={settings.failure_message}
              onChange={(e) => setSettings({ ...settings, failure_message: e.target.value })}
              placeholder="Error submitting form. Please try again."
            />
          </div>

          <div>
            <Label>No Data Message</Label>
            <Input
              type="text"
              value={settings.no_data_message}
              onChange={(e) => setSettings({ ...settings, no_data_message: e.target.value })}
              placeholder="No entries found"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Message to display when there are no entries to show
            </p>
          </div>

          <div>
            <Label>Redirect Page</Label>
            <Select
              options={[
                { value: "", label: "None (show success message)" },
                ...pages.map(page => ({
                  value: page.slug,
                  label: page.title
                }))
              ]}
              value={settings.redirect_page}
              onChange={(value) => setSettings({ ...settings, redirect_page: value })}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select a page to redirect to after successful form submission
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/forms/edit/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}