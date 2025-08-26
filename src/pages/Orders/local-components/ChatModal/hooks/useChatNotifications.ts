import { useState, useEffect, useRef } from 'react';
import { OrderChatService } from '../../../../../db-service/order-chat';

interface UseChatNotificationsParams {
  orderItemId: string;
  onRealtime?: () => void;
}

export const useChatNotifications = ({ orderItemId, onRealtime }: UseChatNotificationsParams) => {
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    if (!orderItemId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log(`🔔 [useChatNotifications] Inicializando listener para orderItemId: ${orderItemId}`);

    // 1) Checar estado inicial (se há mensagens não lidas)
    OrderChatService.getChatStats(orderItemId)
      .then(stats => {
        if (!mounted) return;
        setHasNewMessages((stats?.unread_messages ?? 0) > 0);
      })
      .catch(err => {
        console.warn('🔔 [useChatNotifications] Erro ao buscar chat stats:', err);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    // 2) Criar subscription separada para notificações (apenas INSERTs para este orderItemId)
    const channel = OrderChatService.subscribeToNotifications(orderItemId, (newMessage) => {
      console.log('🔔 [useChatNotifications] Subscription callback DISPARADO em tempo real para orderItemId:', orderItemId, 'Mensagem:', newMessage);
      // Sempre que uma nova mensagem for inserida para esse orderItem, marcar como true
      setHasNewMessages(true);
      // Se foi passado um callback para forçar re-render, chama
      if (typeof onRealtime === 'function') {
        onRealtime();
      }
    });

    channelRef.current = channel;

    // Cleanup: remover subscription
    return () => {
      mounted = false;
      console.log(`🔔 [useChatNotifications] Limpando subscription para orderItemId: ${orderItemId}`);
      if (channelRef.current) {
        OrderChatService.unsubscribeFromNotifications(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderItemId]);

  const markAsRead = async () => {
    console.log(`🔔 [useChatNotifications] Marcando mensagens como lidas para orderItemId: ${orderItemId}`);
    try {
      if (orderItemId) {
        await OrderChatService.markItemMessagesAsRead(orderItemId);
      }
    } catch (err) {
      console.error('🔔 [useChatNotifications] Falha ao marcar mensagens como lidas:', err);
    }
    setHasNewMessages(false);
  };

  // Função para ser chamada externamente quando uma nova mensagem chegar (manter compatibilidade)
  const notifyNewMessage = () => {
    setHasNewMessages(true);
  };

  return {
    hasNewMessages,
    isLoading,
    markAsRead,
    notifyNewMessage
  };
};
