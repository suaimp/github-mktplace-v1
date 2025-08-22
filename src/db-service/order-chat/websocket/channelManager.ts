/**
 * Gerenciador de canais WebSocket
 * Responsabilidade única: Gerenciar ciclo de vida dos canais de comunicação
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { ChannelConfig, WebSocketCallbacks } from './types';
import { WEBSOCKET_CONFIG, CONNECTION_STATUS, ConnectionStatus } from './config';
import { WebSocketUtils } from './utils';

/**
 * Classe responsável por gerenciar canais WebSocket individuais
 */
export class WebSocketChannelManager {
  private channel: RealtimeChannel | null = null;
  private config: ChannelConfig;
  private callbacks: WebSocketCallbacks;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
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
        console.log(`📡 [ChannelManager] Subscription status change:`, {
          status,
          orderItemId: this.config.orderItemId,
          timestamp: new Date().toISOString(),
          reconnectAttempts: this.reconnectAttempts
        });

        if (status === 'SUBSCRIBED') {
          console.log(`✅ [ChannelManager] Successfully subscribed to channel`);
          this.setConnectionStatus(CONNECTION_STATUS.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn(`⚠️ [ChannelManager] Channel closed or error:`, {
            status,
            orderItemId: this.config.orderItemId,
            timestamp: new Date().toISOString()
          });
          this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
          this.handleReconnection(supabase);
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
      console.log('📥 [ChannelManager] === BROADCAST RECEBIDO ===', {
        event: 'new_message',
        orderItemId: this.config.orderItemId,
        payloadReceived: !!payload,
        payloadPayload: !!payload?.payload,
        messageId: payload?.payload?.id,
        messageText: payload?.payload?.message?.substring(0, 50) + '...',
        senderId: payload?.payload?.sender_id,
        timestamp: new Date().toISOString()
      });

      if (WebSocketUtils.validateBroadcastMessage(payload.payload)) {
        console.log('✅ [ChannelManager] Mensagem válida, chamando callback...');
        this.callbacks.onMessage(payload.payload);
        console.log('✅ [ChannelManager] Callback onMessage executado');
      } else {
        console.warn('⚠️ [ChannelManager] Mensagem inválida recebida:', {
          payload: payload.payload,
          validation: 'failed'
        });
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
      if (payload.status === 'CLOSED') {
        this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      }
    });
  }

  /**
   * Envia mensagem via broadcast
   */
  async sendBroadcast(event: string, payload: any): Promise<void> {
    console.log('📡 [ChannelManager] === ENVIANDO BROADCAST ===', {
      event,
      orderItemId: this.config.orderItemId,
      connectionStatus: this.connectionStatus,
      channelExists: !!this.channel,
      payloadId: payload?.id,
      payloadText: payload?.message?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    if (!this.channel || this.connectionStatus !== CONNECTION_STATUS.CONNECTED) {
      const error = `Canal não conectado: channel=${!!this.channel}, status=${this.connectionStatus}`;
      console.error('❌ [ChannelManager] Erro no sendBroadcast:', error);
      throw new Error(error);
    }

    try {
      console.log('⏳ [ChannelManager] Chamando channel.send...');
      await this.channel.send({
        type: 'broadcast',
        event,
        payload
      });
      console.log('✅ [ChannelManager] Broadcast enviado com sucesso!', {
        event,
        payloadId: payload?.id,
        orderItemId: this.config.orderItemId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('💥 [ChannelManager] Erro ao enviar broadcast:', {
        error,
        event,
        orderItemId: this.config.orderItemId,
        connectionStatus: this.connectionStatus,
        timestamp: new Date().toISOString()
      });
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
    this.clearTimers();
    
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    
    this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  /**
   * Tenta reconectar automaticamente
   */
  private handleReconnection(supabase: any): void {
    console.log(`🔄 [ChannelManager] Handling reconnection:`, {
      attempts: this.reconnectAttempts,
      maxAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
      orderItemId: this.config.orderItemId,
      timestamp: new Date().toISOString()
    });

    if (this.reconnectAttempts >= WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.error(`❌ [ChannelManager] Max reconnection attempts reached`);
      this.setConnectionStatus(CONNECTION_STATUS.ERROR);
      this.callbacks.onError?.('Máximo de tentativas de reconexão atingido');
      return;
    }

    this.setConnectionStatus(CONNECTION_STATUS.RECONNECTING);
    
    const delay = WebSocketUtils.calculateReconnectDelay(this.reconnectAttempts);
    console.log(`⏰ [ChannelManager] Scheduling reconnection in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      console.log(`🔄 [ChannelManager] Attempting reconnection #${this.reconnectAttempts}`);
      try {
        await this.connect(supabase);
      } catch (error) {
        console.error(`💥 [ChannelManager] Reconnection #${this.reconnectAttempts} failed:`, error);
      }
    }, delay);
  }

  /**
   * Inicia heartbeat para manter conexão ativa
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.channel && this.connectionStatus === CONNECTION_STATUS.CONNECTED) {
        this.channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { timestamp: Date.now() }
        }).catch((error) => {
          console.warn('Heartbeat falhou:', error);
          // Não desconecta imediatamente, pode ser temporário
          // this.setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
        });
      }
    }, WEBSOCKET_CONFIG.HEARTBEAT_INTERVAL);
  }

  /**
   * Para o heartbeat
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Limpa todos os timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearHeartbeat();
  }

  /**
   * Define status da conexão e notifica callbacks
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    const previousStatus = this.connectionStatus;
    if (this.connectionStatus !== status) {
      console.log(`🔄 [ChannelManager] Connection status change:`, {
        from: previousStatus,
        to: status,
        orderItemId: this.config.orderItemId,
        timestamp: new Date().toISOString(),
        reconnectAttempts: this.reconnectAttempts
      });

      this.connectionStatus = status;
      const isConnected = status === CONNECTION_STATUS.CONNECTED;
      
      console.log(`📢 [ChannelManager] Notifying connection change:`, {
        isConnected,
        orderItemId: this.config.orderItemId,
        timestamp: new Date().toISOString()
      });

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
