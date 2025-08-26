/**
 * Gerenciador de canais WebSocket
 * Responsabilidade única: Gerenciar ciclo de vida dos canais de comunicação
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { ChannelConfig, WebSocketCallbacks } from './types';
import { CONNECTION_STATUS, ConnectionStatus } from './config';
import { handleChannelStatusCallback } from './listeners/statusListener';
import { WebSocketUtils } from './utils';

/**
 * Classe responsável por gerenciar canais WebSocket individuais
 */
export class WebSocketChannelManager {
  private channel: RealtimeChannel | null = null;
  private config: ChannelConfig;
  private callbacks: WebSocketCallbacks;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionStatus: ConnectionStatus = CONNECTION_STATUS.DISCONNECTED;

  constructor(config: ChannelConfig, callbacks: WebSocketCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  /**
   * Conecta ao canal WebSocket
   */
  async connect(supabase: any): Promise<RealtimeChannel> {
    try {
      this.setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      
      const channelName = WebSocketUtils.generateChannelName(this.config.orderItemId);
      
      this.channel = supabase.channel(channelName, {
        config: {
          broadcast: { 
            self: this.config.selfBroadcast ?? true 
          },
          presence: this.config.enablePresence ? { 
            key: 'user_id' 
          } : undefined
        }
      });

      this.setupChannelListeners();
      
      if (!this.channel) {
        throw new Error('Falha ao criar canal');
      }

      await this.channel.subscribe((status: string) => {
        console.log(`📡 [Channel] Status change: ${status} for ${channelName}`);
        handleChannelStatusCallback(status, this.callbacks);
        if (status === 'SUBSCRIBED') {
          this.setConnectionStatus(CONNECTION_STATUS.CONNECTED);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        }
      });

      return this.channel;

    } catch (error) {
      this.setConnectionStatus(CONNECTION_STATUS.ERROR);
      this.callbacks.onError?.(`Erro ao conectar: ${error}`);
      throw error;
    }
  }

  /**
   * Configura listeners do canal
   */
  private setupChannelListeners(): void {
    if (!this.channel) return;

    // Listener para novas mensagens
    this.channel.on('broadcast', { event: 'new_message' }, (payload) => {
      if (WebSocketUtils.validateBroadcastMessage(payload.payload)) {
        this.callbacks.onMessage(payload.payload);
      }
    });

    // Listener para indicadores de digitação
    if (this.config.enableTyping) {
      this.channel.on('broadcast', { event: 'typing' }, (payload) => {
        this.callbacks.onTyping?.(payload.payload);
      });
    }

    // Listener para presença de usuários
    if (this.config.enablePresence) {
      this.channel.on('presence', { event: 'sync' }, () => {
        const presenceState = this.channel?.presenceState();
        if (presenceState) {
          const users = Object.keys(presenceState).map(userId => ({
            userId,
            online_at: new Date().toISOString(),
            status: 'online' as const,
            ...presenceState[userId][0]
          }));
          this.callbacks.onPresenceUpdate?.(users);
        }
      });
    }

    // Listener para eventos do sistema
    this.channel.on('system', {}, (payload) => {
      console.log(`📡 [System] Event received for ${this.config.orderItemId}:`, payload);
      
      if (payload.status === 'CLOSED') {
        console.warn(`🚪 [System] Channel closed for ${this.config.orderItemId}`);
        this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      } else if (payload.status === 'ERROR') {
        console.error(`❌ [System] Channel error for ${this.config.orderItemId}:`, payload);
        this.callbacks.onError?.(`Erro no canal: ${payload.message || 'Erro desconhecido'}`);
      }
    });
  }

  /**
   * Envia mensagem via broadcast
   */
  async sendBroadcast(event: string, payload: any): Promise<void> {
    if (!this.channel || this.connectionStatus !== CONNECTION_STATUS.CONNECTED) {
      const error = `Canal não conectado: channel=${!!this.channel}, status=${this.connectionStatus}`;
      throw new Error(error);
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event,
        payload
      });
    } catch (error) {
      this.callbacks.onError?.(`Erro ao enviar broadcast: ${error}`);
      throw error;
    }
  }

  /**
   * Atualiza presença do usuário
   */
  async updatePresence(presence: any): Promise<void> {
    if (!this.channel || !this.config.enablePresence) return;

    try {
      await this.channel.track(presence);
    } catch (error) {
      this.callbacks.onError?.(`Erro ao atualizar presença: ${error}`);
    }
  }

  /**
   * Desconecta do canal
   */
  async disconnect(): Promise<void> {
    console.log(`🔌 [Manager] Desconectando canal ${this.config.orderItemId}`);
  // Removido: this.isDestroyed
    this.clearTimers();
    
    if (this.channel) {
      try {
        await this.channel.unsubscribe();
        console.log(`✅ [Manager] Canal ${this.config.orderItemId} desconectado com sucesso`);
      } catch (error) {
        console.warn(`⚠️ [Manager] Erro ao desconectar canal ${this.config.orderItemId}:`, error);
      }
      this.channel = null;
    }
    
    this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  /**
   * Tenta reconectar automaticamente
   */
  // Removido: handleReconnection. Reconexão deve ser gerenciada externamente ou por status listener oficial do Supabase.

  // Removido: startHeartbeat e clearHeartbeat. Heartbeat manual não é mais necessário.

  /**
   * Limpa todos os timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Removido: this.clearHeartbeat();
  }

  /**
   * Define status da conexão e notifica callbacks
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      const isConnected = status === CONNECTION_STATUS.CONNECTED;
      this.callbacks.onConnectionChange?.(isConnected);
    }
  }

  /**
   * Retorna status atual da conexão
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.connectionStatus === CONNECTION_STATUS.CONNECTED;
  }
}
