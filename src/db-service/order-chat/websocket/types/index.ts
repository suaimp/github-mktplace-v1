// Tipos centralizados para WebSocket do order-chat

export interface ChannelConfig {
  orderItemId: string;
  selfBroadcast?: boolean;
  enablePresence?: boolean;
  enableTyping?: boolean;
}

export interface WebSocketCallbacks {
  onMessage: (payload: any) => void;
  onTyping?: (payload: any) => void;
  onPresenceUpdate?: (users: any[]) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';

export const CONNECTION_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  RECONNECTING: 'RECONNECTING',
  ERROR: 'ERROR',
} as const;
