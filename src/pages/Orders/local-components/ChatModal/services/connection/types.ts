/**
 * Tipos para gerenciamento de estado de conexão
 * Responsabilidade única: Definir contratos para estados de conexão
 */

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';

export interface ConnectionState {
  status: ConnectionStatus;
  isConnected: boolean;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

export interface ConnectionError {
  type: 'INITIAL_CONNECTION' | 'CONNECTION_LOST' | 'RECONNECTION_FAILED' | 'WEBSOCKET_ERROR';
  message: string;
  shouldShowToUser: boolean;
  canRetry: boolean;
}

export interface ConnectionManagerConfig {
  maxReconnectAttempts: number;
  reconnectDelayMs: number;
  showErrorThresholdMs: number;
}
