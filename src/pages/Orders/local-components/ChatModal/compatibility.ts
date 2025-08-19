/**
 * 🔄 Compatibility Layer - Facilita a migração para WebSocket com novo design
 * 
 * Este arquivo exporta aliases para facilitar a migração gradual
 * do sistema de chat tradicional para WebSocket com novo design.
 */

// Re-exporta o novo componente com design atualizado
export { NewChatModalWebSocket as SimpleChatModal } from './components/NewChatModalWebSocket';
export { NewChatModalWebSocket as SimpleChatModalWebSocket } from './components/NewChatModalWebSocket';

// Mantém componente antigo como legado
export { ChatModalWebSocket as LegacyChatModalWebSocket } from './components/ChatModalWebSocket';

// Re-exporta o hook WebSocket com o mesmo nome do tradicional  
export { useChatWebSocket as useSimpleChat } from './hooks/websocket/useChatWebSocket';

// Componente adaptivo que escolhe automaticamente qual usar
export { AdaptiveChatModal } from './examples/WebSocketUsage';

// Exports do sistema tradicional (para compatibilidade)
export { ChatModal } from './components/ChatModal';
export { ChatButton } from './components/ChatButton';
export { useChat } from './hooks/useChat';
export { useChatModal } from './hooks/useChatModal';

// Exports do sistema WebSocket
export { ChatModalWebSocket } from './components/ChatModalWebSocket';
export {
  useChatWebSocket,
  useTypingIndicator, 
  useUserPresence
} from './hooks/websocket';

// Tipos
export type {
  ChatModalProps,
  ChatMessage,
  ChatState,
} from './types';

export type {
  UseChatWebSocketProps,
  UseChatWebSocketReturn,
  ChatWebSocketState,
  UseTypingIndicatorProps,
  UseUserPresenceProps
} from './hooks/websocket/types';
