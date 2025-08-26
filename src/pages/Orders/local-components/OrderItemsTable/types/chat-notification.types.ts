import type { OrderChatMessage } from '../../../../../db-service/order-chat';

export interface ChatNotificationState {
  hasNewMessages: boolean;
  isLoading: boolean;
  lastUnreadMessage: OrderChatMessage | null;
}
