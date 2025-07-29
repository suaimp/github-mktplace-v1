import { UserRole } from "../types/navigation";
import { NAVIGATION_PATHS, DEFAULT_LOGIN_PATH, FALLBACK_PATH } from "../config/navigationConfig";
import { getCurrentUserRole } from "../services/userRoleService";

/**
 * Obtém o caminho do dashboard baseado no role do usuário
 */
export function getDashboardPath(userRole: UserRole | null): string {
  if (!userRole) {
    return DEFAULT_LOGIN_PATH;
  }
  
  return NAVIGATION_PATHS[userRole].dashboard;
}

/**
 * Obtém o caminho do perfil baseado no role do usuário
 */
export function getProfilePath(userRole: UserRole | null): string {
  if (!userRole) {
    return DEFAULT_LOGIN_PATH;
  }
  
  return NAVIGATION_PATHS[userRole].profile;
}

/**
 * Obtém o caminho das configurações baseado no role do usuário
 */
export function getSettingsPath(userRole: UserRole | null): string {
  if (!userRole) {
    return DEFAULT_LOGIN_PATH;
  }
  
  return NAVIGATION_PATHS[userRole].settings;
}

/**
 * Obtém o caminho "home" apropriado para o usuário atual
 * Esta é a função principal para substituir redirecionamentos para "/"
 */
export async function getHomePathForCurrentUser(): Promise<string> {
  try {
    const userRole = await getCurrentUserRole();
    return getDashboardPath(userRole);
  } catch (error) {
    console.error("Erro ao obter caminho home:", error);
    return FALLBACK_PATH;
  }
}

/**
 * Obtém todos os caminhos para um role específico
 */
export function getAllPathsForRole(userRole: UserRole | null) {
  if (!userRole) {
    return {
      dashboard: DEFAULT_LOGIN_PATH,
      profile: DEFAULT_LOGIN_PATH,
      settings: DEFAULT_LOGIN_PATH
    };
  }
  
  return NAVIGATION_PATHS[userRole];
}
