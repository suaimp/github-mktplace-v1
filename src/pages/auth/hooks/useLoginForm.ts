import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { signInAdmin, signInUser, supabase } from '../../../lib/supabase';
import { LoginFormState, LoginFormActions } from '../interfaces/LoginStates';

/**
 * Hook responsável por gerenciar o estado e ações do formulário de login
 * Seguindo o princípio da Responsabilidade Única (SRP)
 */
export const useLoginForm = (): LoginFormState & LoginFormActions => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determina se é a página de login administrativo
  const isAdminLogin = location.pathname === "/adm";

  useEffect(() => {
    // Verifica se há mensagem de sessão expirada
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
        // Verificar se o usuário está na tabela platform_users (usuário comum)
        // antes de tentar o login admin
        const { data: platformUser } = await supabase
          .from("platform_users")
          .select("id, email")
          .eq("email", email.trim().toLowerCase())
          .maybeSingle();

        if (platformUser) {
          setError("Este usuário não é administrador");
          setLoading(false);
          return;
        }

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

  return {
    // State
    showPassword,
    rememberMe,
    email,
    password,
    error,
    loading,
    // Actions
    setShowPassword,
    setRememberMe,
    setEmail,
    setPassword,
    setError,
    setLoading,
    handleSubmit
  };
};
