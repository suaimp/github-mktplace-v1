/**
 * Serviço especializado para filtrar notificações de chat
 * Responsabilidade única: Aplicar regras de negócio para exibição de notificações de chat
 */

import { UserService } from "../user";
import { NotificationService } from "./notificationService";
import { Notification } from "./types";

export class ChatNotificationFilterService {
  /**
   * Busca notificações de chat filtradas para o usuário atual
   * Regras:
   * - sender_id: quem enviou a mensagem
   * - customer_id: ID do comprador do pedido (orders.user_id)
   * - recipient: destinatário (UUID específico ou "admins")
   * - Admins veem notificações onde recipient = "admins"
   * - Clientes veem notificações onde recipient = seu UUID
   */
  static async getFilteredChatNotifications(
    userId: string, 
    limit: number = 10
  ): Promise<Notification[]> {
    try {
      // Verificar se o usuário atual é admin
      const isAdmin = await UserService.isUserAdmin(userId);
      
      if (isAdmin) {
        // Admins veem notificações destinadas a "admins"
        const chatNotifications = await NotificationService.getNotifications({
          recipient: 'admins',
          type: 'chat',
          limit,
          order_by: 'created_at',
          order_direction: 'desc'
        });

        console.log(`Admin ${userId}: ${chatNotifications.length} notificações de chat encontradas`);
        return chatNotifications;
      } else {
        // Clientes veem apenas notificações onde eles são o destinatário específico
        const chatNotifications = await NotificationService.getNotifications({
          recipient: userId, // Buscar onde o usuário é o destinatário
          type: 'chat',
          limit,
          order_by: 'created_at',
          order_direction: 'desc'
        });

        console.log(`Cliente ${userId}: ${chatNotifications.length} notificações de chat encontradas`);
        return chatNotifications;
      }
    } catch (error) {
      console.error('Erro ao filtrar notificações de chat:', error);
      return [];
    }
  }

  /**
   * Busca todas as notificações do usuário (incluindo chat) com filtro correto
   */
  static async getAllFilteredNotifications(
    userId: string, 
    limit: number = 10
  ): Promise<Notification[]> {
    try {
      // Verificar se o usuário atual é admin
      const isAdmin = await UserService.isUserAdmin(userId);
      
      if (isAdmin) {
        // Admins veem notificações destinadas a "admins" + outras onde são customer
        const [adminNotifications, customerNotifications] = await Promise.all([
          NotificationService.getNotifications({
            recipient: 'admins',
            limit: Math.floor(limit / 2),
            order_by: 'created_at',
            order_direction: 'desc'
          }),
          NotificationService.getNotifications({
            customer_id: userId,
            limit: Math.floor(limit / 2),
            order_by: 'created_at',
            order_direction: 'desc'
          })
        ]);

        // Combinar e remover duplicatas por ID
        const allNotifications = [...adminNotifications, ...customerNotifications];
        const uniqueNotifications = allNotifications.filter((notification, index, self) => 
          index === self.findIndex(n => n.id === notification.id)
        );

        // Ordenar por data e limitar
        return uniqueNotifications
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);
      } else {
        // Clientes veem apenas notificações onde eles são o destinatário específico
        return await NotificationService.getNotifications({
          recipient: userId,
          limit,
          order_by: 'created_at',
          order_direction: 'desc'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar notificações filtradas:', error);
      return [];
    }
  }
}
