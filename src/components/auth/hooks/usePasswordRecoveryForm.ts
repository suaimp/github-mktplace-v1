import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { updatePassword } from "../services/passwordRecoveryService.ts";
import { validatePasswordInput } from "../utils/passwordValidation.ts";

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
    console.log('🔍 [PasswordRecovery] URL atual:', window.location.href);
    console.log('🔍 [PasswordRecovery] Hash completo:', window.location.hash);
    
    const hash = window.location.hash.substring(1);
    console.log('🔍 [PasswordRecovery] Hash sem #:', hash);
    
    if (hash) {
      console.log('🔍 [PasswordRecovery] Hash length:', hash.length);
      console.log('🔍 [PasswordRecovery] Hash primeiros 100 chars:', hash.substring(0, 100));
      
      const hashParams = new URLSearchParams(hash);
      console.log('🔍 [PasswordRecovery] Hash params:', Object.fromEntries(hashParams));
      console.log('🔍 [PasswordRecovery] Hash params size:', hashParams.size);
      
      // Tentar extrair manualmente
      const accessTokenMatch = hash.match(/access_token=([^&]+)/);
      const refreshTokenMatch = hash.match(/refresh_token=([^&]+)/);
      console.log('🔍 [PasswordRecovery] Manual access token match:', !!accessTokenMatch);
      console.log('🔍 [PasswordRecovery] Manual refresh token match:', !!refreshTokenMatch);
      
      if (accessTokenMatch) {
        console.log('🔍 [PasswordRecovery] Access token manual:', accessTokenMatch[1].substring(0, 20) + '...');
      }
      if (refreshTokenMatch) {
        console.log('🔍 [PasswordRecovery] Refresh token manual:', refreshTokenMatch[1].substring(0, 20) + '...');
      }
      
      // Verificar se há erro no hash
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      
      console.log('🔍 [PasswordRecovery] Error:', error);
      console.log('🔍 [PasswordRecovery] Error code:', errorCode);
      
      if (error) {
        console.log('❌ [PasswordRecovery] Erro detectado na URL');
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
      console.log('🔍 [PasswordRecovery] Access token presente:', !!detectedAccessToken);
      console.log('🔍 [PasswordRecovery] Refresh token presente:', !!detectedRefreshToken);
      
      // Se URLSearchParams não funcionou, usar extração manual como fallback
      let finalAccessToken = detectedAccessToken;
      let finalRefreshToken = detectedRefreshToken;
      
      if (!finalAccessToken && accessTokenMatch) {
        console.log('� [PasswordRecovery] Usando extração manual para access_token');
        finalAccessToken = accessTokenMatch[1];
      }
      
      if (!finalRefreshToken && refreshTokenMatch) {
        console.log('🔧 [PasswordRecovery] Usando extração manual para refresh_token');
        finalRefreshToken = refreshTokenMatch[1];
      }
      
      if (finalAccessToken) {
        console.log('🔍 [PasswordRecovery] Access token start:', finalAccessToken.substring(0, 20) + '...');
        setAccessToken(finalAccessToken); // ✅ Armazenar no estado
      }
      
      if (finalRefreshToken) {
        console.log('🔍 [PasswordRecovery] Refresh token start:', finalRefreshToken.substring(0, 20) + '...');
        setRefreshToken(finalRefreshToken); // ✅ Armazenar no estado
      }
      
      // Log final dos tokens armazenados
      console.log('💾 [PasswordRecovery] Tokens armazenados no estado:', {
        accessToken: finalAccessToken ? 'SALVO' : 'NÃO_ENCONTRADO',
        refreshToken: finalRefreshToken ? 'SALVO' : 'NÃO_ENCONTRADO'
      });
    } else {
      console.log('🔍 [PasswordRecovery] Nenhum hash encontrado na URL');
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
        navigate("/", { replace: true });
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
