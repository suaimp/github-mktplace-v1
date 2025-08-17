import { useLocation } from 'react-router';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import Checkbox from '../../../components/form/input/Checkbox';
import Button from '../../../components/ui/button/Button';
import { Link } from 'react-router';
import { EyeIcon, EyeCloseIcon } from '../../../icons';
import { LoginFormState, LoginFormActions } from '../interfaces/LoginStates';

interface LoginFormProps extends LoginFormState, LoginFormActions {}

/**
 * Componente responsável por renderizar o formulário de login
 * Seguindo o princípio da Responsabilidade Única (SRP)
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  showPassword,
  rememberMe,
  email,
  password,
  error,
  loading,
  setShowPassword,
  setRememberMe,
  setEmail,
  setPassword,
  handleSubmit
}) => {
  const location = useLocation();
  const isAdminLogin = location.pathname === "/adm";

  return (
    <>
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          {isAdminLogin ? "Login Administrativo" : "Login"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAdminLogin 
            ? "Digite seu email e senha para acessar o painel administrativo"
            : "Digite seu email e senha para acessar sua conta"
          }
        </p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-white bg-error-500 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label>Email <span className="text-error-500">*</span></Label>
            <Input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>

          <div>
            <Label>Senha <span className="text-error-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={rememberMe} onChange={setRememberMe} />
              <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                Manter conectado
              </span>
            </div>
            <Link
              to={isAdminLogin ? "/adm/reset-password" : "/reset-password"}
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          {!isAdminLogin && (
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Criar Conta
              </Link>
            </p>
          )}
        </div>
      </form>
    </>
  );
};
