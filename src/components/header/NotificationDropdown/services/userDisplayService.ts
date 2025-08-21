/**
 * Serviço para exibição de informações do usuário em notificações
 * Responsabilidade única: Buscar e formatar dados de exibição do usuário (nome, avatar)
 * Princípio DRY: Centraliza lógica de busca de dados de usuário para exibição
 */

import { supabase } from '../../../../lib/supabase';

export interface UserDisplayInfo {
  id: string;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
}

export class UserDisplayService {
  /**
   * Busca informações completas do usuário para exibição
   * Inclui nome completo e URL do avatar
   */
  static async getUserDisplayInfo(userId: string): Promise<UserDisplayInfo> {
    try {
      // Primeiro, verificar se é admin
      const adminInfo = await this.getAdminDisplayInfo(userId);
      if (adminInfo) {
        return adminInfo;
      }

      // Se não for admin, buscar em platform_users
      const platformUserInfo = await this.getPlatformUserDisplayInfo(userId);
      if (platformUserInfo) {
        return platformUserInfo;
      }

      // Fallback para usuário desconhecido
      return {
        id: userId,
        name: 'Usuário Desconhecido',
        avatar: null,
        isAdmin: false
      };
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      return {
        id: userId,
        name: 'Usuário',
        avatar: null,
        isAdmin: false
      };
    }
  }

  /**
   * Busca informações de exibição para admin
   */
  private static async getAdminDisplayInfo(userId: string): Promise<UserDisplayInfo | null> {
    try {
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error || !adminData) {
        return null;
      }

      const avatarUrl = adminData.avatar_url 
        ? this.getStoragePublicUrl('avatars', adminData.avatar_url)
        : null;

      // Formar nome completo igual ao ChatUserService
      const fullName = `${adminData.first_name || ''} ${adminData.last_name || ''}`.trim() 
        || adminData.email?.split('@')[0] || 'Admin';

      return {
        id: adminData.id,
        name: fullName,
        avatar: avatarUrl,
        isAdmin: true
      };
    } catch (error) {
      console.error('Erro ao buscar dados do admin:', error);
      return null;
    }
  }

  /**
   * Busca informações de exibição para usuário da plataforma
   */
  private static async getPlatformUserDisplayInfo(userId: string): Promise<UserDisplayInfo | null> {
    try {
      const { data: userData, error } = await supabase
        .from('platform_users')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error || !userData) {
        return null;
      }

      const avatarUrl = userData.avatar_url 
        ? this.getStoragePublicUrl('avatars', userData.avatar_url)
        : null;

      // Formar nome completo
      const fullName = [userData.first_name, userData.last_name]
        .filter(Boolean)
        .join(' ') || userData.email?.split('@')[0] || 'Usuário';

      return {
        id: userData.id,
        name: fullName,
        avatar: avatarUrl,
        isAdmin: false
      };
    } catch (error) {
      console.error('Erro ao buscar dados do usuário da plataforma:', error);
      return null;
    }
  }

  /**
   * Gera URL pública do storage do Supabase
   */
  private static getStoragePublicUrl(bucket: string, filePath: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Busca informações de múltiplos usuários em lote (otimização)
   */
  static async getBatchUserDisplayInfo(userIds: string[]): Promise<Map<string, UserDisplayInfo>> {
    const result = new Map<string, UserDisplayInfo>();
    
    if (userIds.length === 0) {
      return result;
    }

    try {
      // Buscar todos os admins em lote
      const { data: adminsData } = await supabase
        .from('admins')
        .select('id, first_name, last_name, email, avatar_url')
        .in('id', userIds);

      // Buscar todos os platform_users em lote
      const { data: usersData } = await supabase
        .from('platform_users')
        .select('id, first_name, last_name, email, avatar_url')
        .in('id', userIds);

      // Processar admins
      if (adminsData) {
        adminsData.forEach(admin => {
          const avatarUrl = admin.avatar_url 
            ? this.getStoragePublicUrl('avatars', admin.avatar_url)
            : null;

          // Formar nome completo igual ao ChatUserService
          const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() 
            || admin.email?.split('@')[0] || 'Admin';

          result.set(admin.id, {
            id: admin.id,
            name: fullName,
            avatar: avatarUrl,
            isAdmin: true
          });
        });
      }

      // Processar platform_users (apenas os que não são admins)
      if (usersData) {
        usersData.forEach(user => {
          if (!result.has(user.id)) { // Não sobrescrever admins
            const avatarUrl = user.avatar_url 
              ? this.getStoragePublicUrl('avatars', user.avatar_url)
              : null;

            const fullName = [user.first_name, user.last_name]
              .filter(Boolean)
              .join(' ') || user.email?.split('@')[0] || 'Usuário';

            result.set(user.id, {
              id: user.id,
              name: fullName,
              avatar: avatarUrl,
              isAdmin: false
            });
          }
        });
      }

      // Adicionar fallback para usuários não encontrados
      userIds.forEach(userId => {
        if (!result.has(userId)) {
          result.set(userId, {
            id: userId,
            name: 'Usuário Desconhecido',
            avatar: null,
            isAdmin: false
          });
        }
      });

      return result;
    } catch (error) {
      console.error('Erro ao buscar informações em lote:', error);
      
      // Fallback: criar entradas para todos os IDs
      userIds.forEach(userId => {
        result.set(userId, {
          id: userId,
          name: 'Usuário',
          avatar: null,
          isAdmin: false
        });
      });

      return result;
    }
  }
}
