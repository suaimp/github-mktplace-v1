import { useLocation } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import MarketplaceStatusBanner from "./components/MarketplaceStatusBanner";
import TawkChat from "../../components/TawkChat/TawkChat";
import { useLoginInitialization } from "./hooks/useLoginInitialization";
import { useLoginForm } from "./hooks/useLoginForm";
import { LoginForm } from "./components/LoginForm";

export default function Login() {
  const location = useLocation();
  const { 
    isInitializing, 
    shouldShowForm
  } = useLoginInitialization();
  
  const loginFormProps = useLoginForm();

  // Determine if this is the admin login page
  const isAdminLogin = location.pathname === "/adm";

  // Exibir tela em branco durante inicialização (flash/splash)
  if (isInitializing) {
    return (
      <>
        <TawkChat />
        <PageMeta
          pageTitle={isAdminLogin ? "Login Administrativo" : "Login"}
          description={isAdminLogin ? "Acesse o painel administrativo" : "Acesse sua conta na plataforma"}
        />
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
          {/* Tela em branco - splash screen */}
        </div>
      </>
    );
  }

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

              {/* Exibir formulário apenas se permitido */}
              {shouldShowForm && (
                <LoginForm {...loginFormProps} />
              )}
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}