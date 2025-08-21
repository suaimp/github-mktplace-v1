/**
 * Serviço para operações relacionadas ao usuário
 * Responsabilidade única: Gerenciar dados e permissões de usuários
 */

import { supabase } from "../../lib/supabase";

export class UserService {
  /**
   * Verifica se o usuário atual é admin
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      return await this.isUserAdmin(user.user.id);
    } catch (error) {
      console.error("Erro ao verificar se usuário é admin:", error);
      return false;
    }
  }

  /**
   * Verifica se um usuário específico é admin
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data: adminData } = await supabase
        .from("admins")
        .select("role_id")
        .eq("id", userId)
        .maybeSingle();

      if (!adminData || !adminData.role_id) return false;

      // Verificar se tem role admin
      const { data: roleData } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "admin")
        .eq("id", adminData.role_id)
        .maybeSingle();

      return !!roleData;
    } catch (error) {
      console.error("Erro ao verificar permissões de admin:", error);
      return false;
    }
  }

  /**
   * Busca informações básicas do usuário
   */
  static async getUserInfo(userId: string) {
    try {
      // Primeiro, tentar buscar em admins
      const { data: adminData } = await supabase
        .from('admins')
        .select('id, name, email')
        .eq('id', userId)
        .maybeSingle();

      if (adminData) {
        return {
          id: adminData.id,
          name: adminData.name || 'Admin',
          email: adminData.email,
          avatar: `/images/admin-avatar.png`,
          isAdmin: true
        };
      }

      // Se não for admin, buscar em auth.users
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      
      if (userData.user) {
        return {
          id: userData.user.id,
          name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'Usuário',
          email: userData.user.email,
          avatar: userData.user.user_metadata?.avatar_url,
          isAdmin: false
        };
      }

      return {
        id: userId,
        name: 'Usuário Desconhecido',
        avatar: `/images/default-avatar.png`,
        isAdmin: false
      };
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      return {
        id: userId,
        name: 'Usuário',
        avatar: `/images/default-avatar.png`,
        isAdmin: false
      };
    }
  }
}
