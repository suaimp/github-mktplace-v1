import { supabase } from '../../lib/supabase';

/**
 * Serviço responsável pela verificação de permissões de administrador
 * Princípio da Responsabilidade Única: Apenas gerencia verificações de admin
 */
export class AdminService {
  /**
   * Verifica se um usuário é administrador
   * @param userId - ID do usuário a ser verificado
   * @returns Promise<boolean> - true se for admin, false caso contrário
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      console.log('🔍 [AdminService] Verificando se usuário é admin:', userId);
      
      // 1. Buscar o ID do role admin na tabela roles
      const adminRoleId = await this.getAdminRoleId();
      
      console.log('🔍 [AdminService] Admin role ID encontrado:', adminRoleId);
      
      if (!adminRoleId) {
        console.log('❌ [AdminService] Role admin não encontrado');
        return false;
      }

      // 2. Verificar se o usuário está na tabela admins com role correto
      const isAdmin = await this.checkUserInAdminsTable(userId, adminRoleId);
      
      console.log(`${isAdmin ? '✅' : '❌'} [AdminService] Resultado final:`, isAdmin);
      
      return isAdmin;
    } catch (error) {
      console.error('❌ [AdminService] Erro ao verificar se usuário é admin:', error);
      return false;
    }
  }

  /**
   * Busca o ID do role "admin" na tabela roles
   * @returns Promise<string | null> - ID do role admin ou null se não encontrado
   */
  private static async getAdminRoleId(): Promise<string | null> {
    const { data: adminRole, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar role admin:', error);
      return null;
    }

    return adminRole?.id || null;
  }

  /**
   * Verifica se o usuário está na tabela admins com o role correto
   * @param userId - ID do usuário
   * @param adminRoleId - ID do role admin
   * @returns Promise<boolean> - true se encontrado com role correto
   */
  private static async checkUserInAdminsTable(
    userId: string, 
    adminRoleId: string
  ): Promise<boolean> {
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('role, role_id')
      .eq('id', userId)
      .eq('role', 'admin')
      .eq('role_id', adminRoleId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar usuário na tabela admins:', error);
      return false;
    }

    return !!adminData;
  }

  /**
   * Verifica se o usuário atual (logado) é admin
   * @returns Promise<boolean> - true se for admin, false caso contrário
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return false;
      }

      return await this.isUserAdmin(user.id);
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
      return false;
    }
  }
}
