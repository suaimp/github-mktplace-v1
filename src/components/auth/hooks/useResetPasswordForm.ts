import { useState } from "react";
import { validateEmailInput } from "../utils/emailNormalization";
import { sendPasswordResetEmail } from "../services/resetPasswordService";

/**
 * Hook para gerenciar estado e lógica do formulário de reset de senha
 * Responsabilidade: Centralizar lógica de estado e validação do formulário
 */

export interface UseResetPasswordFormReturn {
  // Estado
  email: string;
  loading: boolean;
  error: string;
  success: boolean;
  rateLimitRemaining: number | null;
  
  // Ações
  setEmail: (email: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

export const useResetPasswordForm = (): UseResetPasswordFormReturn => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);

  const clearError = () => {
    setError("");
    setRateLimitRemaining(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    try {
      // Validar entrada do email
      const validation = validateEmailInput(email);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Tentar enviar email de reset
      const result = await sendPasswordResetEmail(email);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(true);
      
    } catch (err: any) {
      console.error("Erro ao enviar email de recuperação:", err);
      
      // Tratar erro de rate limit
      if (err?.context?.status === 429) {
        const retryAfter = err?.context?.headers?.get('Retry-After');
        const minutes = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 60;
        
        setError(`Muitas tentativas. Por favor, aguarde ${minutes} minutos antes de tentar novamente.`);
        setRateLimitRemaining(minutes);
      } else {
        setError(err.message || "Erro ao enviar email de recuperação. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    loading,
    error,
    success,
    rateLimitRemaining,
    setEmail,
    handleSubmit,
    clearError
  };
};
