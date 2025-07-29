import { getCurrentUserProfile } from "../../../../services/db-services/user/userProfileService";
import { UserRole } from "../types/navigation";

/**
 * Obtém o role do usuário atual
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const { isAdmin, profile } = await getCurrentUserProfile();
    
    if (isAdmin) {
      return "admin";
    }
    
    if (profile && 'role' in profile) {
      return (profile as any).role as UserRole;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao obter role do usuário:", error);
    return null;
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isUserAuthenticated(): Promise<boolean> {
  try {
    const { profile } = await getCurrentUserProfile();
    return !!profile;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}
