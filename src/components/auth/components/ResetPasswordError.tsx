/**
 * Componente para exibir mensagens de erro do reset de senha
 * Responsabilidade: Renderizar diferentes tipos de erro com formatação adequada
 */

interface ResetPasswordErrorProps {
  error: string;
  rateLimitRemaining?: number | null;
}

export const ResetPasswordError = ({ error, rateLimitRemaining }: ResetPasswordErrorProps) => {
  return (
    <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-500/15 dark:text-error-500">
      {error}
      {rateLimitRemaining && (
        <div className="mt-2 text-xs">
          Tempo restante: {rateLimitRemaining} minutos
        </div>
      )}
    </div>
  );
};
