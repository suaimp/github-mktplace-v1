import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from './input/InputField';
import Label from './Label';
import Select from './Select';
import { supabase } from '../../lib/supabase';

interface FormSettingsProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function FormSettings({ formId, isOpen, onClose, onUpdate }: FormSettingsProps) {
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
    redirect_page: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadFormSettings();
      loadPages();
    }
  }, [isOpen]);

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
        .eq('id', formId)
        .single();

      if (error) throw error;

      if (form) {
        setSettings({
          title: form.title || "",
          description: form.description || "",
          submit_button_text: form.submit_button_text || "Enviar",
          success_message: form.success_message || "",
          failure_message: form.failure_message || "",
          redirect_page: form.redirect_page || ""
        });
      }
      
    } catch (err) {
      console.error('Error loading form settings:', err);
      setError('Error loading form settings');
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
          updated_by: user.id
        })
        .eq('id', formId);

      if (updateError) throw updateError;

      setSuccess(true);
      onUpdate();
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error saving form settings:', err);
      setError('Error saving form settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-[700px] m-4"
    >
      <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Configurações do Formulário
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure as opções gerais do formulário
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
            Configurações salvas com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Título do Formulário</Label>
            <Input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              type="text"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Texto do Botão de Envio</Label>
            <Input
              type="text"
              value={settings.submit_button_text}
              onChange={(e) => setSettings({ ...settings, submit_button_text: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Mensagem de Sucesso</Label>
            <Input
              type="text"
              value={settings.success_message}
              onChange={(e) => setSettings({ ...settings, success_message: e.target.value })}
              placeholder="Formulário enviado com sucesso!"
            />
          </div>

          <div>
            <Label>Mensagem de Erro</Label>
            <Input
              type="text"
              value={settings.failure_message}
              onChange={(e) => setSettings({ ...settings, failure_message: e.target.value })}
              placeholder="Erro ao enviar formulário. Tente novamente."
            />
          </div>

          <div>
            <Label>Página de Redirecionamento</Label>
            <Select
              options={[
                { value: "", label: "Nenhuma (exibir mensagem de sucesso)" },
                ...pages.map(page => ({
                  value: page.slug,
                  label: page.title
                }))
              ]}
              value={settings.redirect_page}
              onChange={(value) => setSettings({ ...settings, redirect_page: value })}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Selecione uma página para redirecionar após o envio bem-sucedido do formulário
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}