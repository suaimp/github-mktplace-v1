import { UserRole, NavigationPaths } from "../types/navigation";

/**
 * Configuração de caminhos por role de usuário
 */
export const NAVIGATION_PATHS: Record<UserRole, NavigationPaths> = {
  admin: {
    dashboard: "/dashboard",
    profile: "/profile",
    settings: "/settings"
  },
  publisher: {
    dashboard: "/publisher/dashboard",
    profile: "/publisher/profile",
    settings: "/publisher/settings"
  },
  advertiser: {
    dashboard: "/advertiser/dashboard",
    profile: "/advertiser/profile",
    settings: "/advertiser/settings"
  }
};

/**
 * Rota padrão para usuários não autenticados
 */
export const DEFAULT_LOGIN_PATH = "/";

/**
 * Rota de fallback quando não é possível determinar o role
 */
export const FALLBACK_PATH = "/";
