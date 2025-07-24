/**
 * Componente para exibir mensagens de erro da definição de nova senha
 * Responsabilidade: Renderizar diferentes tipos de erro com formatação adequada
 */

interface PasswordRecoveryErrorProps {
  error: string;
}

export const PasswordRecoveryError = ({ error }: PasswordRecoveryErrorProps) => {
  return (
    <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
      {error}
    </div>
  );
};
