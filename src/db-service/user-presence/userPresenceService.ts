/**
 * Serviço para gerenciar presença de usuários
 * Responsabilidade única: CRUD e lógica de negócio para presença de usuários
 */

import { supabase } from '../../lib/supabase';
import { 
  UserPresenceData, 
  CreateUserPresenceInput, 
  GetUserPresenceInput,
  UserPresenceStatus 
} from './types';

/**
 * Serviço para operações de presença
 */
export class UserPresenceService {
  private static readonly TABLE_NAME = 'user_presence';

  /**
   * Cria ou atualiza presença de usuário
   */
  static async upsertUserPresence(input: CreateUserPresenceInput): Promise<UserPresenceData | null> {
    try {
      const presenceData = {
        user_id: input.userId,
        email: input.email,
        status: input.status,
        last_seen: new Date().toISOString(),
        online_at: input.status === 'online' ? new Date().toISOString() : null,
        order_item_id: input.orderItemId
      };

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .upsert(presenceData, {
          onConflict: 'user_id,order_item_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar presença:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao upsert presença:', error);
      return null;
    }
  }

  /**
   * Define usuário como online
   */
  static async setUserOnline(userId: string, email?: string, orderItemId?: string): Promise<boolean> {
    const result = await this.upsertUserPresence({
      userId,
      email,
      status: 'online',
      orderItemId
    });
    return result !== null;
  }

  /**
   * Define usuário como offline
   */
  static async setUserOffline(userId: string, orderItemId?: string): Promise<boolean> {
    const result = await this.upsertUserPresence({
      userId,
      status: 'offline',
      orderItemId
    });
    return result !== null;
  }

  /**
   * Define usuário como digitando
   */
  static async setUserTyping(userId: string, orderItemId?: string): Promise<boolean> {
    const result = await this.upsertUserPresence({
      userId,
      status: 'typing',
      orderItemId
    });
    return result !== null;
  }

  /**
   * Define usuário como idle
   */
  static async setUserIdle(userId: string, orderItemId?: string): Promise<boolean> {
    const result = await this.upsertUserPresence({
      userId,
      status: 'idle',
      orderItemId
    });
    return result !== null;
  }

  /**
   * Busca presença de usuários
   */
  static async getUsersPresence(input: GetUserPresenceInput = {}): Promise<UserPresenceData[]> {
    try {
      let query = supabase.from(this.TABLE_NAME).select('*');

      if (input.userId) {
        query = query.eq('user_id', input.userId);
      }

      if (input.orderItemId) {
        query = query.eq('order_item_id', input.orderItemId);
      }

      if (input.status) {
        query = query.eq('status', input.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar presença:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar presença:', error);
      return [];
    }
  }

  /**
   * Busca usuários online para um chat específico
   */
  static async getOnlineUsersForChat(orderItemId: string): Promise<UserPresenceData[]> {
    return this.getUsersPresence({
      orderItemId,
      status: 'online'
    });
  }

  /**
   * Verifica se um usuário específico está online
   */
  static async isUserOnline(userId: string, orderItemId?: string): Promise<boolean> {
    const presence = await this.getUsersPresence({
      userId,
      orderItemId,
      status: 'online'
    });
    return presence.length > 0;
  }

  /**
   * Remove presença do usuário (logout completo)
   */
  static async removeUserPresence(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao remover presença:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover presença:', error);
      return false;
    }
  }

  /**
   * Define todos os usuários de um chat como offline (cleanup)
   */
  static async setAllUsersOfflineForChat(orderItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          status: 'offline',
          last_seen: new Date().toISOString()
        })
        .eq('order_item_id', orderItemId)
        .neq('status', 'offline');

      if (error) {
        console.error('Erro ao definir usuários offline:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao definir usuários offline:', error);
      return false;
    }
  }

  /**
   * Limpa presença antiga (usuários que não atualizaram há mais de X minutos)
   */
  static async cleanupStalePresence(minutesThreshold: number = 5): Promise<boolean> {
    try {
      const thresholdTime = new Date(Date.now() - minutesThreshold * 60 * 1000).toISOString();

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({ 
          status: 'offline' as UserPresenceStatus,
          last_seen: new Date().toISOString()
        })
        .lt('last_seen', thresholdTime)
        .neq('status', 'offline');

      if (error) {
        console.error('Erro ao limpar presença antiga:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao limpar presença antiga:', error);
      return false;
    }
  }
}
