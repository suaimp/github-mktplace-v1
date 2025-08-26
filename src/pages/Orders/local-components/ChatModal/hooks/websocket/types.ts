/**
 * Tipos para hooks WebSocket do chat
 */

import { UserPresence } from '../../../../../../db-service/order-chat';

/**
 * Props para o hook useChatWebSocket
 */
export interface UseChatWebSocketProps {
  orderId: string;
  orderItemId: string;
  entryId?: string;
  isOpen: boolean;
}

/**
 * Estado do chat WebSocket
 */
export interface ChatWebSocketState {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  isTyping: boolean;
  unreadCount: number;
  onlineUsers: UserPresence[];
  typingUsers: string[];
  connectionStatus: string;
  error?: string | null;
}

/**
 * Interface para mensagem do chat (UI)
 */
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  senderId?: string; // CORREÇÃO: Adiciona o ID real do remetente
  timestamp: string;
  isRead: boolean;
  isTemporary?: boolean;
}

/**
 * Retorno do hook useChatWebSocket
 */
export interface UseChatWebSocketReturn {
  chatState: ChatWebSocketState;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  markAsRead: () => Promise<void>;
  reconnect: () => Promise<void>;
  isOtherUserOnline: boolean;
  currentUserId: string | null;
  currentUserType: 'user' | 'admin' | null;
}

/**
 * Props para o hook useTypingIndicator
 */
export interface UseTypingIndicatorProps {
  orderItemId: string;
  userId: string;
  onTypingChange?: (users: string[]) => void;
}

/**
 * Props para o hook useUserPresence
 */
export interface UseUserPresenceProps {
  orderItemId: string;
  userId: string;
  userEmail?: string;
  onPresenceChange?: (users: UserPresence[]) => void;
}
