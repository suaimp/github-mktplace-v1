import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Switch from "../../components/form/switch/Switch";
import Select from "../../components/form/Select";
import { supabase } from "../../lib/supabase";

interface PagarmeSettings {
  id?: string;
  antifraude_min_amount: number;
  created_at?: string;
  updated_at?: string;
  pagarme_test_mode: boolean;
  antifraude_enabled: boolean;
  pagarme_webhook_secret: string | null;
  payment_methods: string[];
  currency: string;
}

interface ValidationErrors {
  antifraude_min_amount?: string;
}

export default function PagarmeSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [secretsConfigured, setSecretsConfigured] = useState(false);
  const [settings, setSettings] = useState<PagarmeSettings>({
    antifraude_min_amount: 10.00,
    pagarme_test_mode: true,
    antifraude_enabled: true,
    pagarme_webhook_secret: "",
    payment_methods: ["credit_card"],
    currency: "BRL"
  });

  useEffect(() => {
    loadSettings();
    checkSecretsConfiguration();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);

      // Busca o PRIMEIRO registro existente
      const { data, error } = await supabase
        .from("pagarme_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings({
          ...data,
          payment_methods: Array.isArray(data.payment_methods)
            ? data.payment_methods
            : typeof data.payment_methods === 'string' && data.payment_methods.startsWith('{')
              ? JSON.parse(data.payment_methods.replace(/^{|}$/g, '[').replace(/,/g, ',').replace(/"/g, ''))
              : [data.payment_methods],
          id: data.id // garante que o id está presente
        });
      } else {
        setSettings({
          antifraude_min_amount: 10.00,
          pagarme_test_mode: true,
          antifraude_enabled: true,
          pagarme_webhook_secret: "",
          payment_methods: ["credit_card"],
          currency: "BRL"
        });
      }
    } catch (err: any) {
      console.error("Erro ao carregar configurações do Pagar.me:", err);
      setError("Erro ao carregar configurações do Pagar.me");
    } finally {
      setLoading(false);
    }
  }

  async function checkSecretsConfiguration() {
    try {
      // Verificar se as chaves estão configuradas chamando a edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSecretsConfigured(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'check_keys' })
      });

      // Se retornar sem erro de chaves não configuradas, significa que estão ok
      const result = await response.json();
      setSecretsConfigured(!result.error || !result.error.includes('não configurada'));
    } catch (err) {
      console.log("Erro ao verificar chaves:", err);
      setSecretsConfigured(false);
    }
  }

  const validateSettings = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (settings.antifraude_min_amount < 1) {
      errors.antifraude_min_amount = "Valor mínimo deve ser maior que R$ 1,00";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ 
      ...prev, 
      [name]: name === 'antifraude_min_amount' ? parseFloat(value) || 0 : value 
    }));

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePaymentMethodsChange = (method: string, checked: boolean) => {
    if (method === "credit_card" && !checked) return;

    setSettings((prev) => {
      const currentMethods = prev.payment_methods || ["credit_card"];
      if (checked) {
        return { ...prev, payment_methods: [...currentMethods, method] };
      } else {
        return { 
          ...prev, 
          payment_methods: currentMethods.filter((m) => m !== method) 
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSettings()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const saveData = {
        antifraude_min_amount: settings.antifraude_min_amount,
        pagarme_test_mode: settings.pagarme_test_mode,
        antifraude_enabled: settings.antifraude_enabled,
        pagarme_webhook_secret: settings.pagarme_webhook_secret,
        payment_methods: settings.payment_methods,
        currency: settings.currency,
        updated_at: new Date().toISOString()
      };

      if (settings.id) {
        // UPDATE
        const { error } = await supabase
          .from("pagarme_settings")
          .update(saveData)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        // INSERT (só se não existe nenhum registro)
        // Busca novamente para garantir que não existe nenhum registro
        const { data: existing, error: fetchError } = await supabase
          .from("pagarme_settings")
          .select("id")
          .order("created_at", { ascending: true })
          .limit(1)
          .single();
        if (existing && existing.id) {
          // Se já existe, faz update ao invés de insert
          const { error } = await supabase
            .from("pagarme_settings")
            .update(saveData)
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          // Só insere se realmente não existe nenhum registro
          const { error } = await supabase
            .from("pagarme_settings")
            .insert([saveData]);
          if (error) throw error;
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar configurações do Pagar.me:", err);
      setError(err.message || "Erro ao salvar configurações do Pagar.me");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodOptions = [
    { value: "credit_card", text: "Cartão de crédito" },
    { value: "debit_card", text: "Cartão de débito" },
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
          Configurações do Pagar.me salvas com sucesso!
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Integração com Pagar.me
          </h3>

          <div className="p-4 mb-6 text-sm text-gray-600 bg-gray-50 rounded-lg dark:bg-gray-800 dark:text-gray-400">
            <p>
              O Pagar.me é uma plataforma de pagamentos brasileira que permite
              processar pagamentos de forma segura com PIX, cartões e boleto.
            </p>
            <a
              href="https://dashboard.pagar.me/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Acessar Dashboard do Pagar.me →
            </a>
          </div>

          <div className={`p-4 mb-6 rounded-lg text-sm ${
            secretsConfigured 
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30"
              : "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30"
          }`}>
            {secretsConfigured ? (
              <div>
                <p className="font-medium">✅ Chaves de API Configuradas</p>
                <p>Configuração híbrida - Teste + Produção:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <code>PAGARME</code> - Secret key produção (sk_live_...)</li>
                  <li>• <code>PAGARME_PUBLIC_KEY</code> - Public key produção (pk_live_...)</li>
                  <li>• <code>PAGARME_TEST_SECRET</code> - Secret key teste (sk_test_...)</li>
                  <li>• <code>PAGARME_TEST_PUBLIC</code> - Public key teste (pk_test_...)</li>
                </ul>
                <p className="mt-2 text-xs font-medium">
                  O sistema alterna automaticamente baseado no "Modo de Teste" abaixo.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">⚠️ Configure as Chaves nos Supabase Edge Function Secrets:</p>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="font-medium text-xs">Chaves de Produção (mantém as atuais):</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• <code>PAGARME</code> - Secret key (sk_live_...)</li>
                      <li>• <code>PAGARME_PUBLIC_KEY</code> - Public key (pk_live_...)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-xs">Chaves de Teste (adicionar):</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• <code>PAGARME_TEST_SECRET</code> - Secret key (sk_test_...)</li>
                      <li>• <code>PAGARME_TEST_PUBLIC</code> - Public key (pk_test_...)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Switch
            label="Modo de Teste"
            checked={settings.pagarme_test_mode}
            onChange={(checked) =>
              handleToggleChange("pagarme_test_mode", checked)
            }
          />
          <div
            className={`mt-2 p-3 rounded-lg text-sm ${
              settings.pagarme_test_mode
                ? "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
            }`}
          >
            {settings.pagarme_test_mode ? (
              <div>
                <p className="font-medium">🧪 Modo de Teste Ativo</p>
                <p>• Use cartões de teste do Pagar.me (ex: 4111111111111111)</p>
                <p>• Transações não serão reais</p>
                <p>• Valores acima de R$ 10,00 são recomendados para evitar bloqueio do antifraude</p>
                <p>• Sistema detecta automaticamente pelo prefixo da chave (sk_test_...)</p>
              </div>
            ) : (
              <div>
                <p className="font-medium">🚀 Modo de Produção Ativo</p>
                <p>• Use cartões reais</p>
                <p>• ⚠️ Transações serão cobradas de verdade</p>
                <p>• Sistema detecta automaticamente pelo prefixo da chave (sk_live_...)</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Chave de Webhook do Pagar.me (Opcional)</Label>
          <Input
            type="text"
            name="pagarme_webhook_secret"
            value={settings.pagarme_webhook_secret || ""}
            onChange={handleChange}
            placeholder="Chave do webhook..."
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure um webhook no Pagar.me para receber notificações de eventos.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label>Configuração do Antifraude</Label>
            <Switch
              label="Ativar Antifraude"
              checked={settings.antifraude_enabled}
              onChange={(checked) =>
                handleToggleChange("antifraude_enabled", checked)
              }
            />
          </div>
          
          {settings.antifraude_enabled && (
            <div>
              <Label>Valor Mínimo para Transações (R$)</Label>
              <Input
                type="number"
                name="antifraude_min_amount"
                value={settings.antifraude_min_amount}
                onChange={handleChange}
                placeholder="10.00"
                min="1"
                error={!!validationErrors.antifraude_min_amount}
                hint={validationErrors.antifraude_min_amount || "Valores muito baixos (ex: R$ 1,00) podem ser bloqueados pelo antifraude"}
              />
            </div>
          )}
        </div>

        <div>
          <Label>Moeda</Label>
          <Select
            options={[
              { value: "BRL", label: "Real Brasileiro (BRL)" }
            ]}
            value={settings.currency}
            onChange={(value) => setSettings({ ...settings, currency: value })}
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
                  checked={(settings.payment_methods || ["credit_card"]).includes(
                    method.value
                  )}
                  onChange={(e) =>
                    handlePaymentMethodsChange(method.value, e.target.checked)
                  }
                  disabled={method.value === "credit_card"}
                  className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                />
                <label
                  htmlFor={`method-${method.value}`}
                  className={`ml-2 text-sm font-medium ${
                    method.value === "credit_card"
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-700 dark:text-gray-400"
                  }`}
                >
                  {method.text}
                  {method.value === "credit_card" && " (obrigatório)"}
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
