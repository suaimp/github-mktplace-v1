/**
 * Exportações dos hooks do ChatModal
 */

// Hooks tradicionais
export { useChat } from './useChat';
export { useChatModal } from './useChatModal';

// Hooks WebSocket
export {
  useChatWebSocket,
  useTypingIndicator,
  useUserPresence
} from './websocket';

// Hooks de Presença
export {
  useGlobalPresence,
  useChatPresence
} from './presence';

export type {
  UseChatWebSocketProps,
  UseChatWebSocketReturn,
  ChatWebSocketState,
  ChatMessage,
  UseTypingIndicatorProps,
  UseUserPresenceProps
} from './websocket';

export type {
  UseGlobalPresenceProps,
  UseGlobalPresenceReturn,
  UseChatPresenceProps,
  UseChatPresenceReturn,
  PresenceStatus,
  PresenceChangeEvent
} from './presence';
