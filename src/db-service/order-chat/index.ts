export { OrderChatService } from './orderChatService';
export type { 
  OrderChatMessage, 
  CreateChatMessageInput, 
  ChatMessageFilters, 
  ChatStats,
  OrderChatMessageWithSender 
} from './types';

// WebSocket exports
export { 
  OrderChatWebSocketService,
  WebSocketChannelManager,
  WebSocketUtils,
  WEBSOCKET_CONFIG,
  CHANNEL_EVENTS,
  CONNECTION_STATUS,
  CHANNEL_PREFIX
} from './websocket';

export type {
  BroadcastChatMessage,
  TypingIndicator,
  UserPresence,
  WebSocketCallbacks,
  ChannelConfig,
  ConnectionStatus
} from './websocket';
