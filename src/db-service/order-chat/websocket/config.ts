/**
 * Configurações e constantes para WebSocket do chat
 */

/**
 * Configurações padrão para reconexão
 */
export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 3,
  HEARTBEAT_INTERVAL: 60000, // 1 minuto em vez de 30 segundos
  MESSAGE_TIMEOUT: 10000,
  TYPING_TIMEOUT: 3000,
} as const;

/**
 * Eventos do canal
 */
export const CHANNEL_EVENTS = {
  NEW_MESSAGE: 'new_message',
  TYPING: 'typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  STATUS_UPDATE: 'status_update',
} as const;

/**
 * Status de conexão
 */
export const CONNECTION_STATUS = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
  RECONNECTING: 'RECONNECTING',
} as const;

/**
 * Tipos de status
 */
export type ConnectionStatus = typeof CONNECTION_STATUS[keyof typeof CONNECTION_STATUS];

/**
 * Prefixos para canais
 */
export const CHANNEL_PREFIX = {
  CHAT: 'chat_',
  PRIVATE: 'private_chat_',
  ADMIN: 'admin_chat_',
} as const;
