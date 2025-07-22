import { supabase } from "../../../lib/supabase";

interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_first_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface PlatformUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "publisher" | "advertiser";
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Busca dados do usuário admin pelo ID
 */
export async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar perfil admin:", error);
    return null;
  }
}

/**
 * Busca dados do usuário da plataforma pelo ID
 */
export async function getPlatformUserProfile(userId: string): Promise<PlatformUser | null> {
  try {
    const { data, error } = await supabase
      .from("platform_users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário da plataforma:", error);
    return null;
  }
}

/**
 * Determina se o usuário é admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    return false;
  }
}

/**
 * Busca o perfil do usuário atual (admin ou platform_user)
 */
export async function getCurrentUserProfile(): Promise<{
  isAdmin: boolean;
  profile: AdminProfile | PlatformUser | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { isAdmin: false, profile: null };
    }

    // Primeiro verifica se é admin
    const adminProfile = await getAdminProfile(user.id);
    if (adminProfile) {
      return { isAdmin: true, profile: adminProfile };
    }

    // Se não é admin, busca como platform_user
    const userProfile = await getPlatformUserProfile(user.id);
    return { isAdmin: false, profile: userProfile };
    
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário atual:", error);
    return { isAdmin: false, profile: null };
  }
}
