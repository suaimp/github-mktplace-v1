/**
 * Interface para definir os estados possíveis do componente de login
 * Seguindo o princípio da Responsabilidade Única (SRP)
 */
export interface LoginFormState {
  showPassword: boolean;
  rememberMe: boolean;
  email: string;
  password: string;
  error: string;
  loading: boolean;
}

/**
 * Interface para definir os estados de inicialização do login
 */
export interface LoginInitializationState {
  isInitializing: boolean;
  shouldShowForm: boolean;
  isMaintenanceMode: boolean;
}

/**
 * Interface para ações do formulário de login
 */
export interface LoginFormActions {
  setShowPassword: (show: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
