/**
 * Interface para mensagens de chat
 */
export interface OrderChatMessage {
  id: string;
  order_id: string;
  order_item_id: string;
  entry_id?: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para criar uma nova mensagem
 */
export interface CreateChatMessageInput {
  order_id: string;
  order_item_id: string;
  entry_id?: string;
  message: string;
  sender_type: 'user' | 'admin';
}

/**
 * Interface para filtros de busca
 */
export interface ChatMessageFilters {
  order_id?: string;
  order_item_id?: string;
  entry_id?: string;
  sender_type?: 'user' | 'admin';
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Interface para estatísticas do chat
 */
export interface ChatStats {
  total_messages: number;
  unread_messages: number;
  last_message_at?: string;
}

/**
 * Interface extendida para mensagens com dados do remetente
 */
export interface OrderChatMessageWithSender extends OrderChatMessage {
  sender?: {
    id: string;
    email?: string;
    full_name?: string;
  };
}
