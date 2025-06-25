import { useState, useEffect } from "react";
import Button from "../ui/button/Button";
import { supabase } from "../../lib/supabase";
import Switch from "../form/switch/Switch";

interface AdminProfile {
  id: string;
  marketing_automation: boolean;
  newsletter: boolean;
  offer_suggestions: boolean;
}

interface UserPreferencesCardProps {
  profile: AdminProfile | null;
  onUpdate: () => void;
}

export default function UserPreferencesCard({
  profile,
  onUpdate
}: UserPreferencesCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [marketingAutomation, setMarketingAutomation] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [offerSuggestions, setOfferSuggestions] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  // Initialize state when component mounts and when profile changes
  useEffect(() => {
    if (profile) {
      setMarketingAutomation(profile.marketing_automation || false);
      setNewsletter(profile.newsletter || false);
      setOfferSuggestions(profile.offer_suggestions || false);
    }
  }, [profile]);

  if (!profile) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const { error: updateError } = await supabase
        .from("admins")
        .update({
          marketing_automation: marketingAutomation,
          newsletter: newsletter,
          offer_suggestions: offerSuggestions
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      onUpdate();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Erro ao atualizar preferências:", err);
      setError("Erro ao atualizar preferências");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Confirmação mais robusta
    const confirmMessage =
      "⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n" +
      "Ao excluir sua conta:\n" +
      "• Todos os seus dados serão permanentemente removidos\n" +
      "• Você perderá acesso a todos os serviços\n" +
      "• Não será possível recuperar informações\n\n" +
      "Digite 'EXCLUIR' para confirmar:";

    const userInput = prompt(confirmMessage);

    if (userInput !== "EXCLUIR") {
      if (userInput !== null) {
        setError("Confirmação incorreta. Operação cancelada.");
      }
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      // Verificar se o usuário ainda está autenticado
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Verificar se o perfil ainda existe
      const { data: existingProfile, error: checkError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", profile.id)
        .single();

      if (checkError || !existingProfile) {
        throw new Error("Perfil não encontrado");
      }

      // Deletar dados do perfil
      const { error: deleteError } = await supabase
        .from("admins")
        .delete()
        .eq("id", profile.id);

      if (deleteError) {
        throw new Error(`Erro ao deletar perfil: ${deleteError.message}`);
      }

      // Fazer logout
      const { error: authError } = await supabase.auth.signOut();
      if (authError) {
        console.warn("Erro ao fazer logout:", authError);
        // Não bloquear o processo se o logout falhar
      }

      // Limpar dados locais
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirecionar para página de login
      window.location.replace("/signin");
    } catch (err) {
      console.error("Erro ao excluir conta:", err);

      let errorMessage = "Erro inesperado ao excluir conta";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(`Falha ao excluir conta: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Preferências
          </h4>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <Switch
                  checked={marketingAutomation}
                  onChange={(checked) => {
                    setMarketingAutomation(checked);
                    setSuccess(false);
                  }}
                  label=""
                />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white/90 mb-2">
                  Automação de Marketing
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className={showFullText ? "" : "line-clamp-2"}>
                    Como parte da Plataforma, enviamos{" "}
                    <b>emails educacionais</b> aos nossos Usuários e
                    apresentamos <b>recursos adicionais da Plataforma</b>,{" "}
                    <b>produtos</b> e <b>promoções periódicas</b> (
                    <i>automação de marketing</i>) - marque esta caixa se você
                    concorda em receber mensagens nossas usando sistemas de
                    chamadas automatizados para fins de marketing direto de
                    serviços e produtos oferecidos.
                  </div>
                  <button
                    onClick={() => setShowFullText(!showFullText)}
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 mt-1"
                  >
                    {showFullText ? "Ler menos ▴" : "Ler mais ▾"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <Switch
                  checked={newsletter}
                  onChange={(checked) => {
                    setNewsletter(checked);
                    setSuccess(false);
                  }}
                  label=""
                />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white/90 mb-2">
                  Newsletter
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>
                    Eu assino a newsletter e concordo com o envio de informações
                    comerciais
                  </strong>{" "}
                  por meio de comunicação eletrônica, incluindo, em particular,
                  e-mail, sobre marketing direto de serviços e produtos
                  oferecidos. A base legal para o processamento de dados é o
                  Artigo 6(1)(a) do GDPR.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                <Switch
                  checked={offerSuggestions}
                  onChange={(checked) => {
                    setOfferSuggestions(checked);
                    setSuccess(false);
                  }}
                  label=""
                />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  Recomendação de Ofertas
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Salvar Preferências"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
              Preferências salvas com sucesso!
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-lg hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {loading ? "Excluindo..." : "Excluir Conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
