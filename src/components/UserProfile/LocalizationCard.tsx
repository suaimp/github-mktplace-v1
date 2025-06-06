import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";
import { supabase } from "../../lib/supabase";

interface AdminProfile {
  id: string;
  email: string;
  phone?: string;
}

interface LocalizationSettings {
  language: string;
  counter_type: string;
  operational_currency: string;
  display_currency: string;
  country: string;
}

const languages = [
  { value: "pl-PL", label: "Polish", description: "Polski" },
  { value: "en-GB", label: "English", description: "English" },
  { value: "de-DE", label: "German", description: "Deutsch" },
  { value: "cs-CS", label: "Czech", description: "Čeština" },
  { value: "sk-SK", label: "Slovak", description: "Slovenčina" },
  { value: "hr-HR", label: "Croatian", description: "Hrvatski" },
  { value: "hu-HU", label: "Hungarian", description: "Magyar" },
  { value: "ro-RO", label: "Romanian", description: "Română" },
  { value: "ua-UA", label: "Ukrainian", description: "Українська" },
  { value: "ru-RU", label: "Russian", description: "Русский" },
  { value: "bg-BG", label: "Bulgarian", description: "Български" },
  { value: "nl-NL", label: "Dutch", description: "Nederlands" },
  { value: "tr-TR", label: "Turkish", description: "Türkçe" },
  { value: "gr-GR", label: "Greek", description: "Ελληνικά" },
  { value: "fr-FR", label: "French", description: "Français" },
  { value: "it-IT", label: "Italian", description: "Italiano" },
  { value: "es-ES", label: "Spanish", description: "Español" },
  { value: "pt-PT", label: "Portuguese", description: "Português" },
  {
    value: "pt-BR",
    label: "Portuguese (Brazil)",
    description: "Português (Brazil)"
  }
];

const counterTypes = [
  { value: "1", label: "Caracteres com espaços" },
  { value: "2", label: "Palavras" }
];

const currencies = [
  { value: "BRL", label: "Real (BRL)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "USDT", label: "Tether (USDT)" }
];

// Map of country codes to their names
const countryNames: { [key: string]: string } = {
  BR: "Brasil",
  US: "Estados Unidos",
  GB: "Reino Unido",
  PT: "Portugal",
  ES: "Espanha",
  FR: "França",
  DE: "Alemanha",
  IT: "Itália",
  JP: "Japão",
  CN: "China",
  AU: "Austrália",
  CA: "Canadá",
  MX: "México",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colômbia",
  PE: "Peru",
  UY: "Uruguai",
  PY: "Paraguai",
  BO: "Bolívia"
};

export default function LocalizationCard({
  profile
}: {
  profile: AdminProfile | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<LocalizationSettings>({
    language: "pt-BR",
    counter_type: "1",
    operational_currency: "BRL",
    display_currency: "BRL",
    country: "BR"
  });

  useEffect(() => {
    loadCompanyData();
  }, [profile?.id]);

  async function loadCompanyData() {
    try {
      setLoading(true);
      setError("");

      const { data: companyData, error: companyError } = await supabase
        .from("company_data")
        .select("country")
        .eq("admin_id", profile?.id)
        .maybeSingle();

      if (companyError && companyError.code !== "PGRST116") {
        throw companyError;
      }

      // If company data exists, use it
      if (companyData) {
        setSettings((prev) => ({
          ...prev,
          country: companyData.country,
          language: companyData.country === "BR" ? "pt-BR" : prev.language,
          operational_currency:
            companyData.country === "BR" ? "BRL" : prev.operational_currency,
          display_currency:
            companyData.country === "BR" ? "BRL" : prev.display_currency
        }));
      }
      // If no company data but Brazilian phone, set defaults
      else if (profile?.phone?.startsWith("+55")) {
        setSettings((prev) => ({
          ...prev,
          country: "BR",
          language: "pt-BR",
          operational_currency: "BRL",
          display_currency: "BRL"
        }));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar configurações");
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

      // Here you would save the settings to your database
      // For now, we'll just simulate success
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Idioma e Moeda
      </h3>

      {error && (
        <div className="p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          Configurações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label>País de Residência</Label>
            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
              <span className="text-gray-700 dark:text-gray-300">
                {countryNames[settings.country] || "País não definido"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              O país é definido em Dados da Empresa
            </p>
          </div>

          <div>
            <Label>
              Moeda Operacional <span className="text-error-500">*</span>
            </Label>
            <Select
              options={currencies}
              value={settings.operational_currency}
              onChange={(value) =>
                setSettings({ ...settings, operational_currency: value })
              }
            />
          </div>

          <div>
            <Label>
              Idioma da Plataforma <span className="text-error-500">*</span>
            </Label>
            <Select
              options={languages}
              value={settings.language}
              onChange={(value) =>
                setSettings({ ...settings, language: value })
              }
            />
          </div>

          <div>
            <Label>
              Número de caracteres/palavras{" "}
              <span className="text-error-500">*</span>
            </Label>
            <Select
              options={counterTypes}
              value={settings.counter_type}
              onChange={(value) =>
                setSettings({ ...settings, counter_type: value })
              }
            />
          </div>

          <div>
            <Label>
              Moeda de Exibição <span className="text-error-500">*</span>
            </Label>
            <Select
              options={currencies}
              value={settings.display_currency}
              onChange={(value) =>
                setSettings({ ...settings, display_currency: value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button variant="outline">Cancelar</Button>
          <Button disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
