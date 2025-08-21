/**
 * Serviço para notificações de chat
 * Responsabilidade única: Gerenciar notificações específicas do chat
 */

import { NotificationService } from "./notificationService";
import { ChatNotificationData } from "./types";

export class ChatNotificationService {
  /**
   * Cria notificações quando uma mensagem de chat é enviada
   * Princípio SRP: Responsabilidade única de criar notificação de chat
   * Nova estrutura: sender_id (quem enviou) + customer_id (cliente do pedido) + recipient (destinatário)
   */
  static async createChatNotification(data: ChatNotificationData): Promise<void> {
    try {
      // Buscar o customer_id do pedido (sempre o comprador)
      const customerIds = await this.getOrderCustomerId(data.orderId);
      
      if (data.senderType === 'user') {
        // Cliente enviou mensagem - criar UMA notificação para todos os admins
        await NotificationService.createNotification({
          sender_id: data.senderId,          // Cliente que enviou
          customer_id: customerIds[0],       // ID do comprador do pedido (orders.user_id)
          recipient: 'admins',               // Todos os admins vão ver
          type: 'chat',
          title: data.orderItemUrl,
          subtitle: data.orderId,
          content: data.message
        });
        
        console.log(`✅ Notificação de chat criada para admins`);
      } else {
        // Admin enviou mensagem - notificar apenas o cliente (comprador)
        if (customerIds.length > 0) {
          await NotificationService.createNotification({
            sender_id: data.senderId,          // Admin que enviou
            customer_id: customerIds[0],       // Cliente do pedido (comprador)
            recipient: customerIds[0],         // Cliente específico vai receber
            type: 'chat',
            title: data.orderItemUrl,
            subtitle: data.orderId,
            content: data.message
          });
          
          console.log(`✅ Notificação de chat criada para cliente ${customerIds[0]}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação de chat:', error);
      // Não propagar o erro para não quebrar o fluxo principal do chat
    }
  }

  /**
   * Busca o destinatário correto para a notificação
   * Se quem enviou foi admin, notifica o cliente
   * Se quem enviou foi cliente, notifica todos os admins
   */
  static async getNotificationRecipients(
    orderId: string,
    senderType: 'user' | 'admin'
  ): Promise<string[]> {
    try {
      if (senderType === 'user') {
        // Cliente enviou mensagem - notificar admins
        return await this.getAdminIds();
      } else {
        // Admin enviou mensagem - notificar o cliente do pedido
        return await this.getOrderCustomerId(orderId);
      }
    } catch (error) {
      console.error('Erro ao buscar destinatários:', error);
      return [];
    }
  }

  /**
   * Busca IDs de todos os admins
   */
  private static async getAdminIds(): Promise<string[]> {
    const { supabase } = await import("../../lib/supabase");
    
    const { data: admins, error } = await supabase
      .from("admins")
      .select("id, role_id")
      .eq("role", "admin");

    if (error) {
      console.error('Erro ao buscar admins:', error);
      return [];
    }

    // Filtrar apenas admins com role_id válido
    const validAdmins = admins?.filter(admin => admin.role_id) || [];
    
    // Verificar se as roles são realmente de admin
    if (validAdmins.length > 0) {
      const roleIds = validAdmins.map(admin => admin.role_id);
      
      const { data: roles } = await supabase
        .from("roles")
        .select("id")
        .in("id", roleIds)
        .eq("name", "admin");

      const validRoleIds = roles?.map(role => role.id) || [];
      
      return validAdmins
        .filter(admin => validRoleIds.includes(admin.role_id))
        .map(admin => admin.id);
    }

    return [];
  }

  /**
   * Busca o ID do cliente de um pedido específico
   */
  private static async getOrderCustomerId(orderId: string): Promise<string[]> {
    const { supabase } = await import("../../lib/supabase");
    
    const { data: order, error } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order?.user_id) {
      console.error('Erro ao buscar cliente do pedido:', error);
      return [];
    }

    return [order.user_id];
  }

  /**
   * Cria uma única notificação para a mensagem de chat
   */
  static async sendChatNotifications(data: ChatNotificationData): Promise<void> {
    try {
      // Criar apenas uma notificação com o sender como user_id
      await this.createChatNotification(data);
      
      console.log(`✅ Notificação criada para mensagem de chat`);
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de chat:', error);
    }
  }
}
