import { useState, useEffect } from "react";
import { NavigationContext, UserRole } from "../types/navigation";
import { getCurrentUserRole, isUserAuthenticated } from "../services/userRoleService";

/**
 * Hook para gerenciar o contexto de navegação do usuário
 */
export function useNavigationContext(): NavigationContext {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNavigationContext();
  }, []);

  const loadNavigationContext = async () => {
    try {
      setIsLoading(true);
      
      const [authenticated, role] = await Promise.all([
        isUserAuthenticated(),
        getCurrentUserRole()
      ]);

      setIsAuthenticated(authenticated);
      setUserRole(role);
    } catch (error) {
      console.error("Erro ao carregar contexto de navegação:", error);
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userRole,
    isAuthenticated,
    isLoading
  };
}
