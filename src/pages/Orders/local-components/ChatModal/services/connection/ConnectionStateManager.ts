/**
 * Gerenciador de estado de conexão
 * Responsabilidade única: Gerenciar estados e transições de conexão WebSocket
 */

import { ConnectionState, ConnectionStatus, ConnectionError, ConnectionManagerConfig } from './types';

export class ConnectionStateManager {
  private state: ConnectionState;
  private config: ConnectionManagerConfig;
  private errorShowTimer?: NodeJS.Timeout;

  constructor(config: Partial<ConnectionManagerConfig> = {}) {
    this.config = {
      maxReconnectAttempts: 5,
      reconnectDelayMs: 3000,
      showErrorThresholdMs: 2000,
      ...config
    };

    this.state = {
      status: 'DISCONNECTED',
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: this.config.maxReconnectAttempts
    };
  }

  /**
   * Obtém o estado atual da conexão
   */
  getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Atualiza o status da conexão
   */
  setStatus(status: ConnectionStatus): void {
    const previousStatus = this.state.status;
    this.state.status = status;
    this.state.isConnected = status === 'CONNECTED';

    // Atualiza timestamps
    if (status === 'CONNECTED') {
      this.state.lastConnectedAt = new Date();
      this.state.reconnectAttempts = 0; // Reset tentativas ao conectar
    } else if (previousStatus === 'CONNECTED' && status === 'DISCONNECTED') {
      this.state.lastDisconnectedAt = new Date();
    }

    console.log(`🔄 [ConnectionManager] Status changed: ${previousStatus} → ${status}`, {
      isConnected: this.state.isConnected,
      reconnectAttempts: this.state.reconnectAttempts,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Incrementa contador de tentativas de reconexão
   */
  incrementReconnectAttempts(): boolean {
    this.state.reconnectAttempts++;
    const canRetry = this.state.reconnectAttempts < this.state.maxReconnectAttempts;
    
    console.log(`🔄 [ConnectionManager] Reconnect attempt ${this.state.reconnectAttempts}/${this.state.maxReconnectAttempts}`, {
      canRetry,
      timestamp: new Date().toISOString()
    });

    return canRetry;
  }

  /**
   * Determina se deve mostrar erro baseado no estado e contexto
   */
  shouldShowError(isModalOpen: boolean): ConnectionError | null {
    // Não mostra erro se modal estiver fechado
    if (!isModalOpen) {
      return null;
    }

    // Se está conectado, não há erro
    if (this.state.isConnected) {
      return null;
    }

    switch (this.state.status) {
      case 'CONNECTING':
        // Durante conexão inicial, não mostra erro imediatamente
        return null;

      case 'DISCONNECTED':
        // Se acabou de desconectar e modal está aberto
        if (this.state.lastDisconnectedAt) {
          const timeSinceDisconnect = Date.now() - this.state.lastDisconnectedAt.getTime();
          
          // Só mostra erro após threshold para evitar flashes
          if (timeSinceDisconnect > this.config.showErrorThresholdMs) {
            return {
              type: 'CONNECTION_LOST',
              message: 'Conexão perdida. Tentando reconectar...',
              shouldShowToUser: true,
              canRetry: true
            };
          }
        }
        return null;

      case 'RECONNECTING':
        return {
          type: 'CONNECTION_LOST',
          message: 'Reconectando...',
          shouldShowToUser: true,
          canRetry: true
        };

      case 'ERROR':
        if (this.state.reconnectAttempts >= this.state.maxReconnectAttempts) {
          return {
            type: 'RECONNECTION_FAILED',
            message: 'Falha na conexão. Funcionalidade limitada.',
            shouldShowToUser: true,
            canRetry: false
          };
        } else {
          return {
            type: 'WEBSOCKET_ERROR',
            message: 'Erro de conexão. Tentando novamente...',
            shouldShowToUser: true,
            canRetry: true
          };
        }

      default:
        return null;
    }
  }

  /**
   * Reset do estado (usado quando modal fecha)
   */
  reset(): void {
    if (this.errorShowTimer) {
      clearTimeout(this.errorShowTimer);
    }

    this.state = {
      status: 'DISCONNECTED',
      isConnected: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: this.config.maxReconnectAttempts
    };

    console.log(`🔄 [ConnectionManager] State reset`, { timestamp: new Date().toISOString() });
  }

  /**
   * Limpa timers ativos
   */
  dispose(): void {
    if (this.errorShowTimer) {
      clearTimeout(this.errorShowTimer);
    }
  }
}
