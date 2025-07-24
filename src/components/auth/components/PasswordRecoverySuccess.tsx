import { Link } from "react-router";

/**
 * Componente para exibir mensagem de sucesso da definição de nova senha
 * Responsabilidade: Renderizar estado de sucesso com instruções ao usuário
 */

interface PasswordRecoverySuccessProps {
  isAdminPanel: boolean;
}

export const PasswordRecoverySuccess = ({ isAdminPanel }: PasswordRecoverySuccessProps) => {
  return (
    <div className="p-4 text-sm text-success-600 bg-success-50 rounded-lg dark:bg-success-500/15 dark:text-success-500">
      <p className="font-medium">Nova senha definida com sucesso!</p>
      <p className="mt-2">
        Sua senha foi atualizada. Você será redirecionado para o login em alguns segundos.
      </p>
      <Link
        to={isAdminPanel ? "/adm" : "/"}
        className="inline-block mt-4 text-brand-500 hover:text-brand-600 dark:text-brand-400"
      >
        Ir para o login agora
      </Link>
    </div>
  );
};
