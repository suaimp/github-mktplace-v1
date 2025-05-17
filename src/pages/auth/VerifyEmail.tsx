import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthLayout";
import { Link } from "react-router";

export default function VerifyEmail() {
  return (
    <>
      <PageMeta
        title="Verifique seu Email | Platform"
        description="Verifique seu email para continuar"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Verifique seu Email
              </h1>
              
              <div className="mb-8">
                <img
                  src="/images/error/success.svg"
                  alt="Email enviado"
                  className="w-32 h-32 mx-auto mb-6 dark:hidden"
                />
                <img
                  src="/images/error/success-dark.svg"
                  alt="Email enviado"
                  className="hidden w-32 h-32 mx-auto mb-6 dark:block"
                />
              </div>

              <p className="mb-6 text-gray-500 dark:text-gray-400">
                Enviamos um email com um link de confirmação para o seu endereço de email.
                Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
              </p>

              <div className="p-4 mb-6 text-sm text-gray-500 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-400">
                <p>
                  Não recebeu o email? Verifique sua pasta de spam ou{" "}
                  <Link to="/resend-verification" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    solicite um novo email
                  </Link>
                </p>
              </div>

              <Link
                to="/"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}