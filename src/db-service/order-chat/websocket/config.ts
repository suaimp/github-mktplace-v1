/**
 * Configurações e constantes para WebSocket do chat
 */

/**
 * Configurações padrão para reconexão
 */
export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 3000, // Reduzido de 5000 para reconectar mais rápido
  MAX_RECONNECT_ATTEMPTS: 5, // Aumentado de 3 para dar mais chances
  HEARTBEAT_INTERVAL: 30000, // Reduzido de 60000 para detectar problemas mais rápido
  MESSAGE_TIMEOUT: 10000,
  TYPING_TIMEOUT: 3000,
  CONNECTION_TIMEOUT: 10000, // Novo: timeout para estabelecer conexão inicial
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
