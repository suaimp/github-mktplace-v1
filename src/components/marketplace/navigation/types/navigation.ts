/**
 * Tipos relacionados à navegação baseada em roles
 */

export type UserRole = "admin" | "publisher" | "advertiser";

export interface NavigationPaths {
  dashboard: string;
  profile: string;
  settings: string;
}

export interface UserNavigationConfig {
  role: UserRole;
  paths: NavigationPaths;
}

export interface NavigationContext {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
