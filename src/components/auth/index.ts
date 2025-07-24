/**
 * Índice dos utilitários e componentes de autenticação
 * Responsabilidade: Centralizar exportações da funcionalidade de reset de senha
 */

// Utilitários
export * from "./utils/emailNormalization";

// Serviços
export * from "./services/resetPasswordService";

// Hooks
export * from "./hooks/useResetPasswordForm";

// Componentes
export * from "./components/ResetPasswordSuccess";
export * from "./components/ResetPasswordError";
