/**
 * Arquivo de índice para exportar componentes e hooks do ChatModal
 */

 
// Componentes WebSocket - Novo design como padrão
export { NewChatModalWebSocket as ChatModalWebSocket } from './components/NewChatModalWebSocket';

 
// Hooks tradicionais
export { useChatModal } from './hooks/useChatModal';
export { useChat } from './hooks/useChat';

// Hooks WebSocket
export {
  useChatWebSocket,
  useTypingIndicator,
  useUserPresence
} from './hooks';

// Tipos tradicionais
export type {
  ChatModalProps,
  ChatMessage,
  ChatState,
} from './types';

// Tipos WebSocket
export type {
  UseChatWebSocketProps,
  UseChatWebSocketReturn,
  ChatWebSocketState,
  ChatMessage as WebSocketChatMessage,
  UseTypingIndicatorProps,
  UseUserPresenceProps
} from './hooks';
