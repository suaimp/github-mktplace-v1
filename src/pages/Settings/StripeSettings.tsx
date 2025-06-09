import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Switch from "../../components/form/switch/Switch";
import Select from "../../components/form/Select";
import { supabase } from "../../lib/supabase";

interface StripeSettings {
  id?: string;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  stripe_webhook_secret: string | null;
  stripe_enabled: boolean;
  stripe_test_mode: boolean;
  currency: string;
  payment_methods: string[];
}

interface ValidationErrors {
  stripe_public_key?: string;
  stripe_secret_key?: string;
  stripe_webhook_secret?: string;
}

export default function StripeSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [settings, setSettings] = useState<StripeSettings>({
    stripe_public_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    stripe_enabled: false,
    stripe_test_mode: true,
    currency: "BRL",
    payment_methods: ["card"]
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, create default settings
          const { data: newSettings, error: createError } = await supabase
            .from("payment_settings")
            .insert([
              {
                stripe_enabled: false,
                stripe_test_mode: true,
                currency: "BRL",
                payment_methods: ["card"]
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          setSettings(
            newSettings || {
              stripe_public_key: "",
              stripe_secret_key: "",
              stripe_webhook_secret: "",
              stripe_enabled: false,
              stripe_test_mode: true,
              currency: "BRL",
              payment_methods: ["card"]
            }
          );
        } else {
          throw error;
        }
      } else {
        setSettings(
          data || {
            stripe_public_key: "",
            stripe_secret_key: "",
            stripe_webhook_secret: "",
            stripe_enabled: false,
            stripe_test_mode: true,
            currency: "BRL",
            payment_methods: ["card"]
          }
        );

        // Debug: Log current settings after loading
        console.log("STRIPE SETTINGS LOADED:", {
          stripe_enabled: data?.stripe_enabled,
          stripe_test_mode: data?.stripe_test_mode,
          public_key_type: data?.stripe_public_key?.substring(0, 8),
          secret_key_type: data?.stripe_secret_key?.substring(0, 8),
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar configurações de pagamento:", err);
      setError("Erro ao carregar configurações de pagamento");
    } finally {
      setLoading(false);
    }
  }
  const validateSettings = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (settings.stripe_enabled) {
      if (!settings.stripe_public_key?.trim()) {
        errors.stripe_public_key = "Chave pública do Stripe é obrigatória";
        isValid = false;
      } else if (!settings.stripe_public_key.startsWith("pk_")) {
        errors.stripe_public_key =
          "Chave pública do Stripe deve começar com 'pk_'";
        isValid = false;
      } else {
        // Validar consistência entre modo de teste e tipo de chave
        const isTestMode = settings.stripe_test_mode;
        const isTestKey = settings.stripe_public_key.startsWith("pk_test_");
        const isLiveKey = settings.stripe_public_key.startsWith("pk_live_");

        if (isTestMode && isLiveKey) {
          errors.stripe_public_key =
            "Modo de teste ativo: use chave de teste (pk_test_...)";
          isValid = false;
        } else if (!isTestMode && isTestKey) {
          errors.stripe_public_key =
            "Modo de produção ativo: use chave de produção (pk_live_...)";
          isValid = false;
        }
      }

      if (!settings.stripe_secret_key?.trim()) {
        errors.stripe_secret_key = "Chave secreta do Stripe é obrigatória";
        isValid = false;
      } else if (!settings.stripe_secret_key.startsWith("sk_")) {
        errors.stripe_secret_key =
          "Chave secreta do Stripe deve começar com 'sk_'";
        isValid = false;
      } else {
        // Validar consistência entre modo de teste e tipo de chave
        const isTestMode = settings.stripe_test_mode;
        const isTestKey = settings.stripe_secret_key.startsWith("sk_test_");
        const isLiveKey = settings.stripe_secret_key.startsWith("sk_live_");

        if (isTestMode && isLiveKey) {
          errors.stripe_secret_key =
            "Modo de teste ativo: use chave de teste (sk_test_...)";
          isValid = false;
        } else if (!isTestMode && isTestKey) {
          errors.stripe_secret_key =
            "Modo de produção ativo: use chave de produção (sk_live_...)";
          isValid = false;
        }
      }

      if (!settings.stripe_webhook_secret?.trim()) {
        errors.stripe_webhook_secret =
          "Chave de webhook do Stripe é obrigatória";
        isValid = false;
      } else if (!settings.stripe_webhook_secret.startsWith("whsec_")) {
        errors.stripe_webhook_secret =
          "Chave de webhook do Stripe deve começar com 'whsec_'";
        isValid = false;
      }
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
  const handleToggleChange = (name: string, checked: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [name]: checked };

      // Se alterou o modo de teste, limpar as chaves para evitar inconsistências
      if (name === "stripe_test_mode") {
        const currentPublicKey = prev.stripe_public_key || "";
        const currentSecretKey = prev.stripe_secret_key || "";

        // Verificar se as chaves atuais são inconsistentes com o novo modo
        const isTestMode = checked;
        const hasLivePublicKey = currentPublicKey.startsWith("pk_live_");
        const hasTestPublicKey = currentPublicKey.startsWith("pk_test_");
        const hasLiveSecretKey = currentSecretKey.startsWith("sk_live_");
        const hasTestSecretKey = currentSecretKey.startsWith("sk_test_");

        // Se mudou para modo de teste mas tem chaves de produção, limpar
        if (isTestMode && (hasLivePublicKey || hasLiveSecretKey)) {
          newSettings.stripe_public_key = "";
          newSettings.stripe_secret_key = "";
        }

        // Se mudou para modo de produção mas tem chaves de teste, limpar
        if (!isTestMode && (hasTestPublicKey || hasTestSecretKey)) {
          newSettings.stripe_public_key = "";
          newSettings.stripe_secret_key = "";
        }
      }

      return newSettings;
    });
  };

  const handlePaymentMethodsChange = (method: string, checked: boolean) => {
    setSettings((prev) => {
      let updatedMethods = [...prev.payment_methods];

      if (checked && !updatedMethods.includes(method)) {
        updatedMethods.push(method);
      } else if (!checked && updatedMethods.includes(method)) {
        updatedMethods = updatedMethods.filter((m) => m !== method);
      }

      // Ensure card is always included
      if (!updatedMethods.includes("card")) {
        updatedMethods.push("card");
      }

      return { ...prev, payment_methods: updatedMethods };
    });
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
        .from("payment_settings")
        .select("id")
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (currentSettings?.id) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("payment_settings")
          .update({
            stripe_public_key: settings.stripe_public_key?.trim() || null,
            stripe_secret_key: settings.stripe_secret_key?.trim() || null,
            stripe_webhook_secret:
              settings.stripe_webhook_secret?.trim() || null,
            stripe_enabled: settings.stripe_enabled,
            stripe_test_mode: settings.stripe_test_mode,
            currency: settings.currency,
            payment_methods: settings.payment_methods || ["card"]
          })
          .eq("id", currentSettings.id);

        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from("payment_settings")
          .insert([
            {
              stripe_public_key: settings.stripe_public_key?.trim() || null,
              stripe_secret_key: settings.stripe_secret_key?.trim() || null,
              stripe_webhook_secret:
                settings.stripe_webhook_secret?.trim() || null,
              stripe_enabled: settings.stripe_enabled,
              stripe_test_mode: settings.stripe_test_mode,
              currency: settings.currency,
              payment_methods: settings.payment_methods || ["card"]
            }
          ]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar configurações de pagamento:", err);
      setError(err.message || "Erro ao salvar configurações de pagamento");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodOptions = [
    { value: "card", text: "Cartão de crédito" },
    { value: "boleto", text: "Boleto" },
    { value: "pix", text: "PIX" }
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      {error && (
        <div className="mb-6 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
          Configurações de pagamento salvas com sucesso!
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Integração com Stripe
            </h3>
            <Switch
              label="Ativar Stripe"
              checked={settings.stripe_enabled}
              onChange={(checked) =>
                handleToggleChange("stripe_enabled", checked)
              }
            />
          </div>

          <div className="p-4 mb-6 text-sm text-gray-600 bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-400">
            <p>
              O Stripe é uma plataforma de pagamentos online que permite
              processar pagamentos de forma segura. Para configurar a
              integração, você precisará criar uma conta no Stripe e obter as
              chaves de API.
            </p>
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Acessar Dashboard do Stripe →
            </a>
          </div>
        </div>{" "}
        <div>
          <Switch
            label="Modo de Teste"
            checked={settings.stripe_test_mode}
            onChange={(checked) =>
              handleToggleChange("stripe_test_mode", checked)
            }
          />
          <div
            className={`mt-2 p-3 rounded-lg text-sm ${
              settings.stripe_test_mode
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
            }`}
          >
            {settings.stripe_test_mode ? (
              <div>
                <p className="font-medium">🧪 Modo de Teste Ativo</p>
                <p>
                  • Use chaves que começam com{" "}
                  <code className="bg-yellow-100 px-1 rounded dark:bg-yellow-500/20">
                    pk_test_
                  </code>{" "}
                  e{" "}
                  <code className="bg-yellow-100 px-1 rounded dark:bg-yellow-500/20">
                    sk_test_
                  </code>
                </p>
                <p>• Use cartões de teste do Stripe (ex: 4242424242424242)</p>
                <p>• Transações não serão reais</p>
              </div>
            ) : (
              <div>
                <p className="font-medium">🚀 Modo de Produção Ativo</p>
                <p>
                  • Use chaves que começam com{" "}
                  <code className="bg-red-100 px-1 rounded dark:bg-red-500/20">
                    pk_live_
                  </code>{" "}
                  e{" "}
                  <code className="bg-red-100 px-1 rounded dark:bg-red-500/20">
                    sk_live_
                  </code>
                </p>
                <p>• Use cartões reais</p>
                <p>• ⚠️ Transações serão cobradas de verdade</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <Label>Chave Pública do Stripe</Label>
          <Input
            type="text"
            name="stripe_public_key"
            value={settings.stripe_public_key || ""}
            onChange={handleChange}
            placeholder={
              settings.stripe_test_mode ? "pk_test_..." : "pk_live_..."
            }
            error={!!validationErrors.stripe_public_key}
            hint={validationErrors.stripe_public_key}
            disabled={!settings.stripe_enabled}
          />
        </div>
        <div>
          <Label>Chave Secreta do Stripe</Label>
          <Input
            type="password"
            name="stripe_secret_key"
            value={settings.stripe_secret_key || ""}
            onChange={handleChange}
            placeholder={
              settings.stripe_test_mode ? "sk_test_..." : "sk_live_..."
            }
            error={!!validationErrors.stripe_secret_key}
            hint={validationErrors.stripe_secret_key}
            disabled={!settings.stripe_enabled}
          />
        </div>
        <div>
          <Label>Chave de Webhook do Stripe</Label>
          <Input
            type="text"
            name="stripe_webhook_secret"
            value={settings.stripe_webhook_secret || ""}
            onChange={handleChange}
            placeholder="whsec_..."
            error={!!validationErrors.stripe_webhook_secret}
            hint={validationErrors.stripe_webhook_secret}
            disabled={!settings.stripe_enabled}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure um webhook no Stripe para receber notificações de eventos.
          </p>
        </div>
        <div>
          <Label>Moeda</Label>
          <Select
            options={[
              { value: "BRL", label: "Real Brasileiro (BRL)" },
              { value: "USD", label: "Dólar Americano (USD)" },
              { value: "EUR", label: "Euro (EUR)" }
            ]}
            value={settings.currency}
            onChange={(value) => setSettings({ ...settings, currency: value })}
            disabled={!settings.stripe_enabled}
          />
        </div>
        <div>
          <Label>Métodos de Pagamento</Label>
          <div className="mt-2 space-y-2">
            {paymentMethodOptions.map((method) => (
              <div key={method.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`method-${method.value}`}
                  checked={(settings.payment_methods || ["card"]).includes(
                    method.value
                  )}
                  onChange={(e) =>
                    handlePaymentMethodsChange(method.value, e.target.checked)
                  }
                  disabled={!settings.stripe_enabled || method.value === "card"}
                  className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                />
                <label
                  htmlFor={`method-${method.value}`}
                  className={`ml-2 text-sm font-medium ${
                    !settings.stripe_enabled || method.value === "card"
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {method.text}
                  {method.value === "card" && " (obrigatório)"}
                </label>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Selecione os métodos de pagamento que deseja aceitar. Cartão de
            crédito é obrigatório.
          </p>
        </div>
        <div className="flex justify-end pt-6">
          <Button disabled={loading}>
            {loading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </form>
  );
}
