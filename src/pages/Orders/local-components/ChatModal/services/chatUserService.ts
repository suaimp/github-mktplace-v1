/**
 * Serviço para identificar usuário atual no chat
 * Responsabilidade única: Determinar tipo de usuário e buscar informações
 * DRY: Reutiliza a mesma lógica do projeto para verificar admin/platform_user
 */

import { supabase } from '../../../../../lib/supabase';

export interface CurrentUserInfo {
  userId: string;
  name: string;
  email: string;
  type: 'admin' | 'platform_user';
  table: 'admins' | 'platform_users';
}

export interface OrderParticipantInfo {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  currentUserType: 'admin' | 'user';
  showingUserInfo: CurrentUserInfo;
}

/**
 * Serviço para gerenciar informações do usuário atual no chat
 */
export class ChatUserService {
  /**
   * Busca informações do usuário atual
   * Segue o mesmo padrão do UserAvatar e outros componentes do projeto
   */
  static async getCurrentUserInfo(): Promise<CurrentUserInfo | null> {
    try {
      // 1. Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 2. Verificar se é admin (mesmo padrão do projeto)
      const { data: adminData } = await supabase
        .from('admins')
        .select('id, first_name, last_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (adminData) {
        return {
          userId: adminData.id,
          name: `${adminData.first_name} ${adminData.last_name}`.trim(),
          email: adminData.email,
          type: 'admin',
          table: 'admins'
        };
      }

      // 3. Se não é admin, buscar em platform_users
      const { data: platformData } = await supabase
        .from('platform_users')
        .select('id, first_name, last_name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (platformData) {
        return {
          userId: platformData.id,
          name: `${platformData.first_name} ${platformData.last_name}`.trim(),
          email: platformData.email,
          type: 'platform_user',
          table: 'platform_users'
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar informações do usuário atual:', error);
      return null;
    }
  }

  /**
   * Determina quais informações mostrar no header do chat
   * Para admin: mostra dados do comprador
   * Para cliente: mostra dados do suporte
   */
  static async getOrderParticipantInfo(orderData: any): Promise<OrderParticipantInfo | null> {
    try {
      const currentUser = await this.getCurrentUserInfo();
      if (!currentUser) return null;

      // Se o usuário atual é admin, mostrar dados do comprador
      if (currentUser.type === 'admin') {
        return {
          buyerId: orderData.user_id,
          buyerName: orderData.billing_name || 'Cliente',
          buyerEmail: orderData.billing_email || '',
          currentUserType: 'admin',
          showingUserInfo: {
            userId: orderData.user_id,
            name: orderData.billing_name || 'Cliente',
            email: orderData.billing_email || '',
            type: 'platform_user',
            table: 'platform_users'
          }
        };
      }

      // Se o usuário atual é cliente, mostrar dados do suporte
      return {
        buyerId: currentUser.userId,
        buyerName: currentUser.name,
        buyerEmail: currentUser.email,
        currentUserType: 'user',
        showingUserInfo: {
          userId: '', // ID vazio para suporte - não precisa buscar avatar
          name: 'Suporte',
          email: 'suporte@exemplo.com',
          type: 'admin',
          table: 'admins'
        }
      };

    } catch (error) {
      console.error('Erro ao determinar participantes do chat:', error);
      return null;
    }
  }

  /**
   * Verifica se usuário atual é admin
   * Mesma lógica usada em todo o projeto
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      return !!adminData;
    } catch (error) {
      console.error('Erro ao verificar se usuário é admin:', error);
      return false;
    }
  }

  /**
   * Busca dados de um usuário específico por ID
   * Usado para mostrar dados do outro participante
   */
  static async getUserInfoById(userId: string): Promise<CurrentUserInfo | null> {
    try {
      // Primeiro tenta em admins
      const { data: adminData } = await supabase
        .from('admins')
        .select('id, first_name, last_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (adminData) {
        return {
          userId: adminData.id,
          name: `${adminData.first_name} ${adminData.last_name}`.trim(),
          email: adminData.email,
          type: 'admin',
          table: 'admins'
        };
      }

      // Se não encontrou em admins, tenta em platform_users
      const { data: platformData } = await supabase
        .from('platform_users')
        .select('id, first_name, last_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (platformData) {
        return {
          userId: platformData.id,
          name: `${platformData.first_name} ${platformData.last_name}`.trim(),
          email: platformData.email,
          type: 'platform_user',
          table: 'platform_users'
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  }
}
