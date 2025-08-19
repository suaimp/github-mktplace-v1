/**
 * Exportações principais do módulo WebSocket
 */

export { OrderChatWebSocketService } from './orderChatWebSocketService';
export { WebSocketChannelManager } from './channelManager';
export { WebSocketUtils } from './utils';

export type {
  BroadcastChatMessage,
  TypingIndicator,
  UserPresence,
  WebSocketCallbacks,
  ChannelConfig
} from './types';

export {
  WEBSOCKET_CONFIG,
  CHANNEL_EVENTS,
  CONNECTION_STATUS,
  CHANNEL_PREFIX
} from './config';

export type { ConnectionStatus } from './config';
