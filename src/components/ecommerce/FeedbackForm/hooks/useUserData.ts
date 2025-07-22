import { useState, useEffect } from "react";
import { getCurrentUserProfile } from "../../../../services/db-services/user/userProfileService";
import { UserProfile, UseUserDataReturn } from "../types/user";

/**
 * Hook para carregar dados do usuário (admin ou platform_user)
 */
export default function useUserData(): UseUserDataReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { isAdmin: userIsAdmin, profile: userProfile } = await getCurrentUserProfile();

      if (userProfile) {
        // Normalizar o perfil para o formato comum
        const normalizedProfile: UserProfile = {
          id: userProfile.id,
          email: userProfile.email,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          phone: userProfile.phone || "",
          role: userIsAdmin ? "admin" : (userProfile as any).role,
          is_first_admin: (userProfile as any).is_first_admin,
          status: (userProfile as any).status,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at
        };

        setProfile(normalizedProfile);
        setIsAdmin(userIsAdmin);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err);
      setError("Erro ao carregar dados do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    isAdmin,
    error
  };
}
