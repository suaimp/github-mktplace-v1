// Re-exports para facilitar a importação
export { useNavigationContext } from "./hooks/useNavigationContext";
export { useUserNavigationPaths } from "./hooks/useUserNavigationPaths";
export { getCurrentUserRole, isUserAuthenticated } from "./services/userRoleService";
export { 
  getDashboardPath, 
  getProfilePath, 
  getSettingsPath, 
  getHomePathForCurrentUser,
  getAllPathsForRole 
} from "./utils/navigationUtils";
export { NAVIGATION_PATHS, DEFAULT_LOGIN_PATH, FALLBACK_PATH } from "./config/navigationConfig";
export type { UserRole, NavigationPaths, UserNavigationConfig, NavigationContext } from "./types/navigation";

// Exportações dos componentes de Tab Navigation com ícones
export * from './types';
export * from './components';
