import { useEffect, useState } from 'react';
import { getLastUnreadMessage } from '../chat-notifications/getLastUnreadMessage';
import { OrderChatService } from '../../../../../db-service/order-chat';
import type { OrderChatMessage } from '../../../../../db-service/order-chat';

interface UseChatNotificationsParams {
  orderItemId: string;
  onRealtime?: () => void;
}

export function useChatNotifications({ orderItemId, onRealtime }: UseChatNotificationsParams) {
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUnreadMessage, setLastUnreadMessage] = useState<OrderChatMessage | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!orderItemId) return;
    setIsLoading(true);
    getLastUnreadMessage(orderItemId).then(msg => {
      if (!mounted) return;
      setLastUnreadMessage(msg);
      setHasNewMessages(!!msg);
      setIsLoading(false);
    });
    // Subscrição em tempo real
    const channel = OrderChatService.subscribeToNotifications(orderItemId, (newMessage) => {
      if (!mounted) return;
      setLastUnreadMessage(newMessage.is_read ? null : newMessage);
      setHasNewMessages(!newMessage.is_read);
      if (typeof onRealtime === 'function') onRealtime();
    });
    return () => {
      mounted = false;
      if (channel) OrderChatService.unsubscribeFromNotifications(channel);
    };
  }, [orderItemId]);

  const markAsRead = async () => {
    if (!orderItemId) return;
    await OrderChatService.markItemMessagesAsRead(orderItemId);
    setLastUnreadMessage(null);
    setHasNewMessages(false);
  };

  return { hasNewMessages, isLoading, markAsRead, lastUnreadMessage };
}
