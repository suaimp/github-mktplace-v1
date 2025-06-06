import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { supabase } from "../../lib/supabase";

interface SmtpSettings {
  id?: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string | null;
  smtp_from_email: string | null;
  smtp_from_name: string | null;
}

interface ValidationErrors {
  smtp_pass?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
}

export default function SmtpSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [settings, setSettings] = useState<SmtpSettings>({
    smtp_host: "smtp.resend.com",
    smtp_port: "465",
    smtp_user: "resend",
    smtp_pass: "",
    smtp_from_email: "",
    smtp_from_name: ""
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const { data: newSettings, error: createError } = await supabase
            .from("settings")
            .insert([
              {
                smtp_host: "smtp.resend.com",
                smtp_port: "465",
                smtp_user: "resend"
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          setSettings(newSettings || {});
        } else {
          throw error;
        }
      } else {
        setSettings({
          ...data,
          smtp_host: "smtp.resend.com",
          smtp_port: "465",
          smtp_user: "resend"
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar configurações SMTP:", err);
      setError("Erro ao carregar configurações SMTP");
    } finally {
      setLoading(false);
    }
  }

  const validateSettings = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!settings.smtp_pass?.trim()) {
      errors.smtp_pass = "API Key do Resend é obrigatória";
      isValid = false;
    } else if (!settings.smtp_pass.startsWith("re_")) {
      errors.smtp_pass = "API Key do Resend deve começar com 're_'";
      isValid = false;
    }

    if (!settings.smtp_from_email?.trim()) {
      errors.smtp_from_email = "Email de envio é obrigatório";
      isValid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp_from_email.trim())
    ) {
      errors.smtp_from_email = "Email de envio inválido";
      isValid = false;
    }

    if (!settings.smtp_from_name?.trim()) {
      errors.smtp_from_name = "Nome de exibição é obrigatório";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSettings()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: currentSettings, error: fetchError } = await supabase
        .from("settings")
        .select("id")
        .single();

      if (fetchError) throw fetchError;

      if (!currentSettings?.id) {
        throw new Error("ID das configurações não encontrado");
      }

      const { error: updateError } = await supabase
        .from("settings")
        .update({
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_user: settings.smtp_user,
          smtp_pass: settings.smtp_pass?.trim(),
          smtp_from_email: settings.smtp_from_email?.trim(),
          smtp_from_name: settings.smtp_from_name?.trim()
        })
        .eq("id", currentSettings.id);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err: any) {
      console.error("Erro ao salvar configurações SMTP:", err);
      setError(err.message || "Erro ao salvar configurações SMTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      {error && (
        <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          Configurações SMTP salvas com sucesso!
        </div>
      )}

      <div className="space-y-6">
        <div>
          <Label>API Key do Resend</Label>
          <Input
            type="password"
            name="smtp_pass"
            value={settings.smtp_pass || ""}
            onChange={handleChange}
            placeholder="re_..."
            error={!!validationErrors.smtp_pass}
            hint={validationErrors.smtp_pass}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Use a API Key gerada no painel do Resend
          </p>
        </div>

        <div>
          <Label>Email de Envio</Label>
          <Input
            type="email"
            name="smtp_from_email"
            value={settings.smtp_from_email || ""}
            onChange={handleChange}
            placeholder="noreply@seudominio.com"
            error={!!validationErrors.smtp_from_email}
            hint={validationErrors.smtp_from_email}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Email que aparecerá como remetente (deve ser verificado no Resend)
          </p>
        </div>

        <div>
          <Label>Nome de Exibição</Label>
          <Input
            type="text"
            name="smtp_from_name"
            value={settings.smtp_from_name || ""}
            onChange={handleChange}
            placeholder="Nome da Empresa"
            error={!!validationErrors.smtp_from_name}
            hint={validationErrors.smtp_from_name}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Nome que aparecerá como remetente
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
  );
}
