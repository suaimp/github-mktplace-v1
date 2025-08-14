/**
 * Tipos relacionados à verificação de administrador
 * Princípio da Responsabilidade Única: Apenas definições de tipos para admin
 */

export interface AdminRole {
  id: string;
  name: string;
}

export interface AdminUser {
  id: string;
  role: string;
  role_id: string;
}

export interface AdminCheckResult {
  isAdmin: boolean;
  loading: boolean;
  error?: string;
}

export interface AdminServiceConfig {
  enableLogging?: boolean;
  cacheResults?: boolean;
}
