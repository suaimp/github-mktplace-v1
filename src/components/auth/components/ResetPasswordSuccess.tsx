import { Link } from "react-router";

/**
 * Componente para exibir mensagem de sucesso do reset de senha
 * Responsabilidade: Renderizar estado de sucesso com instruções ao usuário
 */

interface ResetPasswordSuccessProps {
  isAdminPanel: boolean;
}

export const ResetPasswordSuccess = ({ isAdminPanel }: ResetPasswordSuccessProps) => {
  return (
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
  );
};
