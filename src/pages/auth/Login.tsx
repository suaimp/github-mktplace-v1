import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import MarketplaceStatusBanner from "./components/MarketplaceStatusBanner";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import { Link } from "react-router";
import { signInAdmin, signInUser } from "../../lib/supabase";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import TawkChat from "../../components/TawkChat/TawkChat";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if this is the admin login page
  const isAdminLogin = location.pathname === "/adm";

  useEffect(() => {
    // Check for session expired message
    const params = new URLSearchParams(location.search);
    if (params.get("session_expired")) {
      setError("Sua sessão expirou. Por favor, faça login novamente.");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isAdminLogin) {
        // Admin login
        await signInAdmin(email, password);
        navigate("/dashboard", { replace: true });
      } else {
        // Platform user login
        const { platformUser } = await signInUser(email, password);
        
        // Redirect based on user role
        if (platformUser.role === 'publisher') {
          navigate("/publisher/dashboard", { replace: true });
        } else if (platformUser.role === 'advertiser') {
          navigate("/advertiser/dashboard", { replace: true });
        } else {
          throw new Error("Tipo de usuário inválido");
        }
      }
    } catch (err: any) {
      setError(err.message || "Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TawkChat />
      <PageMeta
        pageTitle={isAdminLogin ? "Login Administrativo" : "Login"}
        description={isAdminLogin ? "Acesse o painel administrativo" : "Acesse sua conta na plataforma"}
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              {/* Banner de Status do Marketplace */}
              <div className="mb-6">
                <MarketplaceStatusBanner />
              </div>

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
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}