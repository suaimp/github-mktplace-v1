import { useLocation, Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useResetPasswordForm } from "./hooks/useResetPasswordForm";
import { ResetPasswordSuccess } from "./components/ResetPasswordSuccess";
import { ResetPasswordError } from "./components/ResetPasswordError";

export default function ResetPasswordForm() {
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/adm');
  
  const {
    email,
    loading,
    error,
    success,
    rateLimitRemaining,
    setEmail,
    handleSubmit
  } = useResetPasswordForm();

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
            <ResetPasswordSuccess isAdminPanel={isAdminPanel} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <ResetPasswordError 
                    error={error} 
                    rateLimitRemaining={rateLimitRemaining} 
                  />
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