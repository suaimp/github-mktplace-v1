import { useState } from "react";
import { Link, useLocation } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { resetPassword } from "../../lib/supabase";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const location = useLocation();

  // Determine if this is admin panel
  const isAdminPanel = location.pathname.startsWith('/adm');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRateLimitRemaining(null);

    try {
      // Validar email
      if (!email.trim()) {
        throw new Error("Email é obrigatório");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error("Email inválido");
      }

      await resetPassword(email);
      setSuccess(true);
      
    } catch (err: any) {
      console.error("Erro ao enviar email de recuperação:", err);
      
      // Handle rate limit error
      if (err?.context?.status === 429) {
        const retryAfter = err?.context?.headers?.get('Retry-After');
        const minutes = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 60;
        
        setError(`Muitas tentativas. Por favor, aguarde ${minutes} minutos antes de tentar novamente.`);
        setRateLimitRemaining(minutes);
      } else {
        setError(err.message || "Erro ao enviar email de recuperação. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Recuperar Senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digite seu email para receber instruções de recuperação
            </p>
          </div>

          {success ? (
            <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
              <p>Email de recuperação enviado com sucesso!</p>
              <p className="mt-2">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link
                to={isAdminPanel ? "/adm" : "/"}
                className="inline-block mt-4 text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
                    {error}
                    {rateLimitRemaining && (
                      <div className="mt-2 text-xs">
                        Tempo restante: {rateLimitRemaining} minutos
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    required
                    disabled={loading || !!rateLimitRemaining}
                  />
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={loading || !!rateLimitRemaining}
                  >
                    {loading ? "Enviando..." : "Enviar Email de Recuperação"}
                  </Button>
                </div>
                <div className="text-center">
                  <Link
                    to={isAdminPanel ? "/adm" : "/"}
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Voltar para o login
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}