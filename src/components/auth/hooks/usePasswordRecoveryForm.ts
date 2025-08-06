import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { updatePassword } from "../services/passwordRecoveryService.ts";
import { validatePasswordInput } from "../utils/passwordValidation.ts";
import { DEFAULT_LOGIN_PATH } from "../../marketplace/navigation";

/**
 * Hook para gerenciar estado e lógica do formulário de definir nova senha
 * Responsabilidade: Centralizar lógica de estado e validação do formulário
 */

export interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
}

export interface UsePasswordRecoveryFormReturn {
  // Estado
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  error: string;
  success: boolean;
  validationErrors: ValidationErrors;
  
  // Ações
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  clearError: () => void;
}

export const usePasswordRecoveryForm = (): UsePasswordRecoveryFormReturn => {
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Armazenar tokens no estado para não perdê-los
  const [accessToken, setAccessToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");

  // Verificar erros na URL ao carregar
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      
      // Tentar extrair manualmente
      const accessTokenMatch = hash.match(/access_token=([^&]+)/);
      const refreshTokenMatch = hash.match(/refresh_token=([^&]+)/);
      
      // Verificar se há erro no hash
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      
      if (error) {
        if (errorCode === 'otp_expired') {
          setError("O link de recuperação expirou. Solicite um novo link.");
        } else if (error === 'access_denied') {
          setError("Link de recuperação inválido ou já utilizado. Solicite um novo link.");
        } else {
          setError("Erro no link de recuperação. Solicite um novo link.");
        }
        return;
      }
      
      // Verificar se há tokens usando URLSearchParams
      const detectedAccessToken = hashParams.get('access_token');
      const detectedRefreshToken = hashParams.get('refresh_token');
      
      // Se URLSearchParams não funcionou, usar extração manual como fallback
      let finalAccessToken = detectedAccessToken;
      let finalRefreshToken = detectedRefreshToken;
      
      if (!finalAccessToken && accessTokenMatch) {
        finalAccessToken = accessTokenMatch[1];
      }
      
      if (!finalRefreshToken && refreshTokenMatch) {
        finalRefreshToken = refreshTokenMatch[1];
      }
      
      if (finalAccessToken) {
        setAccessToken(finalAccessToken); // ✅ Armazenar no estado
      }
      
      if (finalRefreshToken) {
        setRefreshToken(finalRefreshToken); // ✅ Armazenar no estado
      }
    }
  }, []);

  const clearError = () => {
    setError("");
    setValidationErrors({});
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validar senha
    const passwordValidation = validatePasswordInput(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
      isValid = false;
    }

    // Validar confirmação de senha
    if (!confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 [PasswordRecovery] Iniciando submit...');
    clearError();

    if (!validateForm()) {
      console.log('❌ [PasswordRecovery] Validação falhou');
      return;
    }

    console.log('✅ [PasswordRecovery] Validação passou');
    setLoading(true);

    try {
      // Usar tokens armazenados no estado (extraídos no useEffect)
      console.log('🔍 [PasswordRecovery] Usando tokens do estado...');
      console.log('🔍 [PasswordRecovery] Tokens do estado:', {
        accessToken: accessToken ? 'PRESENTE' : 'AUSENTE',
        refreshToken: refreshToken ? 'PRESENTE' : 'AUSENTE'
      });
      
      // Log adicional para debug - mostrar primeiros caracteres dos tokens
      if (accessToken) {
        console.log('🔍 [PasswordRecovery] Access token (primeiros 20 chars):', accessToken.substring(0, 20) + '...');
      }
      if (refreshToken) {
        console.log('🔍 [PasswordRecovery] Refresh token (primeiros 20 chars):', refreshToken.substring(0, 20) + '...');
      }
      
      if (!accessToken || !refreshToken) {
        console.log('❌ [PasswordRecovery] Tokens não encontrados no estado');
        throw new Error("Link de recuperação inválido ou expirado.");
      }

      console.log('🔄 [PasswordRecovery] Chamando updatePassword...');
      const updateResult = await updatePassword({
        password: password.trim(),
        accessToken,
        refreshToken
      });
      
      console.log('✅ [PasswordRecovery] Resultado do updatePassword:', updateResult);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }

      console.log('🎉 [PasswordRecovery] Senha atualizada com sucesso!');
      setSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        console.log('🔄 [PasswordRecovery] Redirecionando para login...');
        navigate(DEFAULT_LOGIN_PATH, { replace: true });
      }, 3000);
      
    } catch (err: any) {
      console.error("❌ [PasswordRecovery] Erro ao definir nova senha:", err);
      setError(err.message || "Erro ao definir nova senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
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
    handleSubmit,
    clearError
  };
};
