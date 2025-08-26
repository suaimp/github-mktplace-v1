/**
 * Hook para gerenciar notificações de chat na tabela de itens
 * Reutiliza a lógica do useChatNotifications existente
 */

import { useChatNotifications } from './useChatNotifications';
import type { ChatNotificationState } from '../types/chat-notification.types';

interface UseChatButtonNotificationsParams {
  orderItemId: string;
  onRealtime?: () => void;
}

/**
 * Hook que encapsula a lógica de notificações para o botão de chat da tabela
 * Responsabilidade única: Gerenciar estado de notificações para um item específico
 */
export function useChatButtonNotifications({ 
  orderItemId,
  onRealtime
}: UseChatButtonNotificationsParams): ChatNotificationState & {
  markAsRead: () => Promise<void>;
  notifyNewMessage: () => void;
} {


  const {
    hasNewMessages,
    isLoading,
    markAsRead,
    lastUnreadMessage
  } = useChatNotifications({ orderItemId, onRealtime });

  // Função para compatibilidade - atualmente não implementada no novo hook
  const notifyNewMessage = () => {
    console.log('[useChatButtonNotifications] notifyNewMessage called - deprecated');
  };

  return {
    hasNewMessages,
    isLoading,
    markAsRead,
    lastUnreadMessage,
    notifyNewMessage
  };
}
