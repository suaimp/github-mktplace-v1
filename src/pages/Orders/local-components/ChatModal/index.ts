/**
 * Arquivo de índice para exportar componentes e hooks do ChatModal
 */

// Componentes tradicionais
export { ChatModal } from './components/ChatModal';
export { ChatButton } from './components/ChatButton';

// Componentes WebSocket - Novo design como padrão
export { NewChatModalWebSocket as ChatModalWebSocket } from './components/NewChatModalWebSocket';

// Componente legado (para compatibilidade)
export { ChatModalWebSocket as LegacyChatModalWebSocket } from './components/ChatModalWebSocket';

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
