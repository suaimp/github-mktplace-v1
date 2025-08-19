/**
 * Exportações dos hooks WebSocket
 */

export { useChatWebSocket } from './useChatWebSocket';
export { useTypingIndicator } from './useTypingIndicator';
export { useUserPresence } from './useUserPresence';

export type {
  UseChatWebSocketProps,
  UseChatWebSocketReturn,
  ChatWebSocketState,
  ChatMessage,
  UseTypingIndicatorProps,
  UseUserPresenceProps
} from './types';
