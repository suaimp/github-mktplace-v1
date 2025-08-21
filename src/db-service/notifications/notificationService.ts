/**
 * Serviço para operações CRUD na tabela notifications
 * Responsabilidade única: Gerenciar notificações dos usuários
 */

import { supabase } from "../../lib/supabase";
import { 
  Notification, 
  CreateNotificationInput, 
  UpdateNotificationInput, 
  NotificationFilters 
} from "./types";

export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        sender_id: input.sender_id,
        customer_id: input.customer_id,
        recipient: input.recipient,
        type: input.type,
        title: input.title,
        subtitle: input.subtitle,
        content: input.content,
        order_id: input.order_id        // NOVO: Incluir order_id na criação
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar notificação:", error);
      throw new Error("Falha ao criar notificação");
    }

    return data;
  }

  /**
   * Busca notificações com filtros
   */
  static async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    let query = supabase.from("notifications").select("*");

    // Aplicar filtros
    if (filters.sender_id) {
      query = query.eq("sender_id", filters.sender_id);
    }

    if (filters.customer_id) {
      query = query.eq("customer_id", filters.customer_id);
    }

    if (filters.recipient) {
      query = query.eq("recipient", filters.recipient);
    }

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    // Ordenação
    const orderBy = filters.order_by || 'created_at';
    const orderDirection = filters.order_direction || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Paginação
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar notificações:", error);
      throw new Error("Falha ao buscar notificações");
    }

    return data || [];
  }

  /**
   * Busca uma notificação por ID
   */
  static async getNotificationById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar notificação:", error);
      throw new Error("Falha ao buscar notificação");
    }

    return data;
  }

  /**
   * Atualiza uma notificação
   */
  static async updateNotification(
    id: string, 
    input: UpdateNotificationInput
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar notificação:", error);
      throw new Error("Falha ao atualizar notificação");
    }

    return data;
  }

  /**
   * Remove uma notificação
   */
  static async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar notificação:", error);
      throw new Error("Falha ao deletar notificação");
    }
  }

  /**
   * Busca notificações de um usuário específico (como customer)
   */
  static async getUserNotifications(
    userId: string, 
    limit: number = 20
  ): Promise<Notification[]> {
    return this.getNotifications({
      customer_id: userId,
      limit,
      order_by: 'created_at',
      order_direction: 'desc'
    });
  }

  /**
   * Conta o número de notificações de um usuário (como customer)
   */
  static async countUserNotifications(userId: string, type?: string): Promise<number> {
    let query = supabase
      .from("notifications")
      .select("*", { count: 'exact', head: true })
      .eq("customer_id", userId);

    if (type) {
      query = query.eq("type", type);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Erro ao contar notificações:", error);
      throw new Error("Falha ao contar notificações");
    }

    return count || 0;
  }
}
