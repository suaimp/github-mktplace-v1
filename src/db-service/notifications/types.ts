/**
 * Tipos e interfaces para o serviço de notificações
 */

export interface Notification {
  id: string;
  sender_id: string;    // ID do usuário que enviou a mensagem/criou a notificação
  customer_id?: string; // ID do cliente/comprador do pedido (orders.user_id)
  recipient: string;    // Destinatário: UUID específico ou "admins" para todos os admins
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  order_id?: string;    // NOVO: ID do pedido para redirecionamento
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  sender_id: string;    // Quem está enviando/criando a notificação
  customer_id?: string; // Cliente do pedido (sempre o comprador: orders.user_id)
  recipient: string;    // Destinatário: UUID específico ou "admins" para todos os admins
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  order_id?: string;    // NOVO: ID do pedido para redirecionamento
}

export interface UpdateNotificationInput {
  title?: string;
  subtitle?: string;
  content?: string;
  order_id?: string;    // NOVO: Permitir atualizar order_id
}

export interface NotificationFilters {
  sender_id?: string;   // Filtrar por quem enviou
  customer_id?: string; // Filtrar por cliente do pedido
  recipient?: string;   // Filtrar por destinatário
  type?: string;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'updated_at';
  order_direction?: 'asc' | 'desc';
}

/**
 * Interface específica para notificações de chat
 * Seguindo o princípio Interface Segregation: apenas propriedades necessárias
 */
export interface ChatNotificationData {
  orderId: string;
  orderItemId: string;
  orderItemUrl: string; // URL já construída pelo frontend
  senderId: string;
  senderType: 'user' | 'admin';
  message: string;
}
