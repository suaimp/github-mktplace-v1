/**
 * Tipos específicos para WebSocket do chat
 */

/**
 * Interface para mensagens via broadcast
 */
export interface BroadcastChatMessage {
  id: string;
  message: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  order_item_id: string;
  order_id: string;
  entry_id?: string;
}

/**
 * Interface para indicador de digitação
 */
export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

/**
 * Interface para presença de usuários
 */
export interface UserPresence {
  userId: string;
  email?: string;
  online_at: string;
  status: 'online' | 'typing' | 'idle';
}

/**
 * Interface para callbacks do WebSocket
 */
export interface WebSocketCallbacks {
  onMessage: (message: BroadcastChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onPresenceUpdate?: (presence: UserPresence[]) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * Interface para configuração do canal
 */
export interface ChannelConfig {
  orderItemId: string;
  enablePresence?: boolean;
  enableTyping?: boolean;
  selfBroadcast?: boolean;
}
