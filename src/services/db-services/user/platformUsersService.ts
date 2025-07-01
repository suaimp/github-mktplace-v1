import { supabase } from "../../../lib/supabase";

/**
 * Retorna a contagem total de usuários na tabela platform_users
 */
export async function getPlatformUsersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("platform_users")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Erro ao contar usuários da plataforma:", error);
    return 0;
  }
} 