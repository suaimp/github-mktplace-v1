import { useLocation, Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import { usePasswordRecoveryForm } from "./hooks/usePasswordRecoveryForm.ts";
import { PasswordRecoverySuccess } from "./components/PasswordRecoverySuccess.tsx";
import { PasswordRecoveryError } from "./components/PasswordRecoveryError.tsx";

export default function PasswordRecoveryForm() {
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/adm');
  
  const {
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    success,
    validationErrors,
    setPassword,
    setConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleSubmit
  } = usePasswordRecoveryForm();

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Definir Nova Senha
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Digite sua nova senha para completar a recuperação
            </p>
          </div>

          {success ? (
            <PasswordRecoverySuccess isAdminPanel={isAdminPanel} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {error && (
                  <PasswordRecoveryError error={error} />
                )}

                <div>
                  <Label>
                    Nova Senha <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={!!validationErrors.password}
                      hint={validationErrors.password}
                      placeholder="Digite sua nova senha"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>
                    Confirmar Nova Senha <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={!!validationErrors.confirmPassword}
                      hint={validationErrors.confirmPassword}
                      placeholder="Confirme sua nova senha"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Definir Nova Senha"}
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
