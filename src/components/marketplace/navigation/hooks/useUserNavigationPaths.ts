import { useState, useEffect } from "react";
import { UserRole } from "../types/navigation";
import { 
  getDashboardPath, 
  getProfilePath, 
  getSettingsPath, 
  getHomePathForCurrentUser,
  getAllPathsForRole 
} from "../utils/navigationUtils";
import { getCurrentUserRole } from "../services/userRoleService";

/**
 * Hook para obter caminhos de navegação baseados no role do usuário
 */
export function useUserNavigationPaths() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paths, setPaths] = useState({
    dashboard: "/",
    profile: "/",
    settings: "/",
    home: "/"
  });

  useEffect(() => {
    loadUserPaths();
  }, []);

  const loadUserPaths = async () => {
    try {
      setIsLoading(true);
      const role = await getCurrentUserRole();
      setUserRole(role);

      const rolePaths = getAllPathsForRole(role);
      const homePath = await getHomePathForCurrentUser();

      setPaths({
        dashboard: rolePaths.dashboard,
        profile: rolePaths.profile,
        settings: rolePaths.settings,
        home: homePath
      });
    } catch (error) {
      console.error("Erro ao carregar caminhos do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPaths = () => {
    loadUserPaths();
  };

  return {
    userRole,
    paths,
    isLoading,
    refreshPaths,
    // Funções de conveniência
    getDashboard: () => getDashboardPath(userRole),
    getProfile: () => getProfilePath(userRole),
    getSettings: () => getSettingsPath(userRole),
    getHome: getHomePathForCurrentUser
  };
}
