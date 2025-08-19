import { useState, useEffect, useCallback } from 'react';
import { OrderChatService, OrderChatMessage } from '../../../../../db-service/order-chat';
import { ChatMessage, ChatState } from '../types';

interface UseChatProps {
  orderId: string;
  orderItemId: string;
  entryId?: string;
  isOpen: boolean;
}

/**
 * Hook personalizado para gerenciar o chat
 */
export function useChat({ orderId, orderItemId, entryId, isOpen }: UseChatProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isConnected: false,
    isLoading: true,
    unreadCount: 0
  });

  const [error, setError] = useState<string | null>(null);

  /**
   * Converte mensagem do banco para o formato do componente
   */
  const convertMessage = useCallback((dbMessage: OrderChatMessage): ChatMessage => ({
    id: dbMessage.id,
    text: dbMessage.message,
    sender: dbMessage.sender_type === 'user' ? 'user' : 'admin',
    timestamp: new Date(dbMessage.created_at),
    isRead: dbMessage.is_read
  }), []);

  /**
   * Carrega mensagens do chat
   */
  const loadMessages = useCallback(async () => {
    if (!isOpen) return;

    try {
      setChatState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      const dbMessages = await OrderChatService.getMessages({
        order_item_id: orderItemId,
        entry_id: entryId
      });

      const messages = dbMessages.map(convertMessage);
      const unreadCount = messages.filter(msg => !msg.isRead && msg.sender === 'admin').length;

      setChatState(prev => ({
        ...prev,
        messages,
        unreadCount,
        isLoading: false,
        isConnected: true
      }));

      // Marcar mensagens como lidas
      if (unreadCount > 0) {
        const unreadIds = dbMessages
          .filter(msg => !msg.is_read && msg.sender_type === 'admin')
          .map(msg => msg.id);
        
        if (unreadIds.length > 0) {
          await OrderChatService.markAsRead(unreadIds);
        }
      }

    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError('Falha ao carregar mensagens');
      setChatState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isConnected: false 
      }));
    }
  }, [orderId, orderItemId, entryId, isOpen, convertMessage]);

  /**
   * Envia uma nova mensagem
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      setError(null);
      setChatState(prev => ({ ...prev, isTyping: true }));

      // Verificar se usuário é admin
      const isAdmin = await OrderChatService.isCurrentUserAdmin();
      const senderType = isAdmin ? 'admin' : 'user';

      const newMessage = await OrderChatService.createMessage({
        order_id: orderId,
        order_item_id: orderItemId,
        entry_id: entryId,
        message: message.trim(),
        sender_type: senderType
      });

      const chatMessage = convertMessage(newMessage);

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, chatMessage],
        isTyping: false
      }));

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Falha ao enviar mensagem');
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, [orderId, orderItemId, entryId, convertMessage]);

  /**
   * Obtém estatísticas do chat
   */
  const getChatStats = useCallback(async () => {
    try {
      const stats = await OrderChatService.getChatStats(orderItemId);
      return stats;
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      return null;
    }
  }, [orderItemId]);

  /**
   * Listener para novas mensagens em tempo real
   */
  useEffect(() => {
    if (!isOpen) return;

    let channel: any = null;

    const setupRealtimeListener = () => {
      channel = OrderChatService.subscribeToMessages(orderItemId, (newMessage) => {
        const chatMessage = convertMessage(newMessage);
        
        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, chatMessage],
          unreadCount: chatMessage.sender === 'admin' ? prev.unreadCount + 1 : prev.unreadCount
        }));
      });
    };

    setupRealtimeListener();

    return () => {
      if (channel) {
        OrderChatService.unsubscribeFromMessages(channel);
      }
    };
  }, [orderItemId, isOpen, convertMessage]);

  /**
   * Carrega mensagens quando o modal abre
   */
  useEffect(() => {
    if (isOpen) {
      loadMessages();
    } else {
      // Reset estado quando fecha
      setChatState({
        messages: [],
        isTyping: false,
        isConnected: false,
        isLoading: true,
        unreadCount: 0
      });
      setError(null);
    }
  }, [isOpen, loadMessages]);

  return {
    chatState,
    error,
    sendMessage,
    loadMessages,
    getChatStats
  };
}
