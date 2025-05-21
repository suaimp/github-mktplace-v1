import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import { supabase } from "../../lib/supabase";

interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  body: string;
}

interface ValidationErrors {
  subject?: string;
  body?: string;
}

const templates = [
  { code: "signup_confirmation", name: "Confirmação de Cadastro" },
  { code: "invitation", name: "Convite" },
  { code: "magic_link", name: "Link Mágico" },
  { code: "change_email", name: "Alteração de Email" },
  { code: "reset_password", name: "Redefinição de Senha" },
  { code: "reauthentication", name: "Reautenticação" }
];

export default function EmailTemplates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "signup_confirmation"
  );
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [template, setTemplate] = useState<EmailTemplate>({
    id: "",
    code: "signup_confirmation",
    name: "Confirmação de Cadastro",
    subject: "",
    body: ""
  });

  useEffect(() => {
    loadTemplate(selectedTemplate);
  }, [selectedTemplate]);

  async function loadTemplate(templateCode: string) {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const { data: template, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("code", templateCode)
        .single();

      if (error) throw error;

      if (template) {
        setTemplate(template);
      }
    } catch (err: any) {
      console.error("Erro ao carregar template:", err);
      setError("Erro ao carregar template");
    } finally {
      setLoading(false);
    }
  }

  const validateTemplate = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!template.subject?.trim()) {
      errors.subject = "Assunto é obrigatório";
      isValid = false;
    }

    if (!template.body?.trim()) {
      errors.body = "Corpo do email é obrigatório";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTemplate((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTemplate()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("email_templates")
        .update({
          subject: template.subject.trim(),
          body: template.body.trim()
        })
        .eq("code", template.code);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Erro ao salvar template:", err);
      setError(err.message || "Erro ao salvar template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap -mb-px">
          {templates.map((t) => (
            <button
              key={t.code}
              onClick={() => setSelectedTemplate(t.code)}
              className={`inline-flex items-center h-10 px-4 -mb-px text-sm font-medium transition-colors border-b-2 whitespace-nowrap focus:outline-none ${
                selectedTemplate === t.code
                  ? "border-brand-500 text-brand-500 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl">
        {error && (
          <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
            Template salvo com sucesso!
          </div>
        )}

        <div className="space-y-6">
          <div>
            <Label>Assunto</Label>
            <Input
              type="text"
              name="subject"
              value={template.subject}
              onChange={handleChange}
              placeholder="Digite o assunto do email"
              error={!!validationErrors.subject}
              hint={validationErrors.subject}
            />
          </div>

          <div>
            <Label>Corpo do Email</Label>
            <TextArea
              name="body"
              value={template.body}
              onChange={(value) =>
                handleChange({ target: { name: "body", value } } as any)
              }
              placeholder="Digite o conteúdo do email"
              rows={10}
              error={!!validationErrors.body}
              hint={validationErrors.body}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Você pode usar as seguintes variáveis no template:
              <br />- {`{{name}}`}: Nome do usuário
              <br />- {`{{email}}`}: Email do usuário
              <br />- {`{{link}}`}: Link de ação (quando aplicável)
              <br />- {`{{code}}`}: Código de verificação (quando aplicável)
            </p>
          </div>

          <div className="flex justify-end pt-6">
            <Button variant="outline" onClick={() => {}}>
              Cancelar
            </Button>
            <Button disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
