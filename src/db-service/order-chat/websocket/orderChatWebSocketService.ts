/**
 * Serviço principal para WebSocket do chat
 * Responsabilidade única: Orquestrar comunicação via WebSocket
 */

import { supabase } from '../../../lib/supabase';
import { OrderChatService } from '../orderChatService';
import { CreateChatMessageInput } from '../types';
import { WebSocketChannelManager } from './channelManager';
import { 
  ChannelConfig, 
  WebSocketCallbacks, 
  BroadcastChatMessage,
  TypingIndicator 
} from './types';
import { CHANNEL_EVENTS, WEBSOCKET_CONFIG } from './config';
import { WebSocketUtils } from './utils';

/**
 * Serviço principal para gerenciar WebSocket do chat
 */
export class OrderChatWebSocketService {
  private static managers = new Map<string, WebSocketChannelManager>();
  private static typingTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Conecta ao chat via WebSocket
   */
  static async connectToChat(
    orderItemId: string,
    callbacks: WebSocketCallbacks,
    config: Partial<ChannelConfig> = {}
  ): Promise<WebSocketChannelManager> {
    const channelKey = `chat_${orderItemId}`;
    
    // Se já existe um manager ativo, desconecta primeiro
    if (this.managers.has(channelKey)) {
      await this.disconnectFromChat(orderItemId);
    }

    const channelConfig: ChannelConfig = {
      orderItemId,
      enablePresence: true,
      enableTyping: true,
      selfBroadcast: true,
      ...config
    };

    const manager = new WebSocketChannelManager(channelConfig, callbacks);
    
    try {
      await manager.connect(supabase);
      this.managers.set(channelKey, manager);
      return manager;
    } catch (error) {
      throw new Error(`Falha ao conectar ao chat: ${error}`);
    }
  }

  /**
   * Envia mensagem via WebSocket
   */
  static async sendMessage(
    orderItemId: string,
    messageInput: CreateChatMessageInput
  ): Promise<void> {
    const channelKey = `chat_${orderItemId}`;
    const manager = this.managers.get(channelKey);

    if (!manager || !manager.isConnected()) {
      throw new Error('Canal não conectado');
    }

    try {
      // 1. Salva no banco de dados
      const savedMessage = await OrderChatService.createMessage(messageInput);
      
      // 2. Envia via broadcast
      const broadcastMessage: BroadcastChatMessage = {
        id: savedMessage.id,
        message: savedMessage.message,
        sender_id: savedMessage.sender_id,
        sender_type: savedMessage.sender_type,
        created_at: savedMessage.created_at,
        order_item_id: savedMessage.order_item_id,
        order_id: savedMessage.order_id,
        entry_id: savedMessage.entry_id
      };

      await manager.sendBroadcast(CHANNEL_EVENTS.NEW_MESSAGE, broadcastMessage);
      
    } catch (error) {
      throw new Error(`Falha ao enviar mensagem: ${error}`);
    }
  }

  /**
   * Envia indicador de digitação
   */
  static async sendTypingIndicator(
    orderItemId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channelKey = `chat_${orderItemId}`;
    const manager = this.managers.get(channelKey);

    if (!manager || !manager.isConnected()) {
      return; // Não é crítico se falhar
    }

    try {
      const typingIndicator: TypingIndicator = {
        userId,
        isTyping,
        timestamp: new Date().toISOString()
      };

      await manager.sendBroadcast(CHANNEL_EVENTS.TYPING, typingIndicator);

      // Auto-parar indicador de digitação após timeout
      if (isTyping) {
        this.scheduleTypingStop(orderItemId, userId);
      }
      
    } catch (error) {
      console.warn('Falha ao enviar indicador de digitação:', error);
    }
  }

  /**
   * Atualiza presença do usuário
   */
  static async updateUserPresence(
    orderItemId: string,
    userPresence: {
      userId: string;
      email?: string;
      status: 'online' | 'typing' | 'idle';
    }
  ): Promise<void> {
    const channelKey = `chat_${orderItemId}`;
    const manager = this.managers.get(channelKey);

    if (!manager || !manager.isConnected()) {
      return;
    }

    try {
      await manager.updatePresence({
        user_id: userPresence.userId,
        email: userPresence.email,
        status: userPresence.status,
        online_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Falha ao atualizar presença:', error);
    }
  }

  /**
   * Desconecta do chat
   */
  static async disconnectFromChat(orderItemId: string): Promise<void> {
    const channelKey = `chat_${orderItemId}`;
    const manager = this.managers.get(channelKey);

    if (manager) {
      await manager.disconnect();
      this.managers.delete(channelKey);
    }

    // Limpa timer de digitação
    const typingKey = `${orderItemId}_typing`;
    const typingTimer = this.typingTimers.get(typingKey);
    if (typingTimer) {
      clearTimeout(typingTimer);
      this.typingTimers.delete(typingKey);
    }
  }

  /**
   * Desconecta de todos os chats
   */
  static async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.managers.keys()).map(key => {
      const orderItemId = key.replace('chat_', '');
      return this.disconnectFromChat(orderItemId);
    });

    await Promise.all(disconnectPromises);
  }

  /**
   * Verifica se está conectado a um chat específico
   */
  static isConnectedToChat(orderItemId: string): boolean {
    const channelKey = `chat_${orderItemId}`;
    const manager = this.managers.get(channelKey);
    return manager?.isConnected() ?? false;
  }

  /**
   * Obtém status de conexão
   */
  static getConnectionStatus(orderItemId: string): string {
    const channelKey = `chat_${orderItemId}`;
    const manager = this.managers.get(channelKey);
    return manager?.getConnectionStatus() ?? 'DISCONNECTED';
  }

  /**
   * Obtém lista de chats conectados
   */
  static getConnectedChats(): string[] {
    return Array.from(this.managers.keys())
      .map(key => key.replace('chat_', ''))
      .filter(orderItemId => this.isConnectedToChat(orderItemId));
  }

  /**
   * Agenda parada do indicador de digitação
   */
  private static scheduleTypingStop(orderItemId: string, userId: string): void {
    const typingKey = `${orderItemId}_${userId}_typing`;
    
    // Limpa timer anterior se existir
    const existingTimer = this.typingTimers.get(typingKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Agenda nova parada
    const timer = setTimeout(() => {
      this.sendTypingIndicator(orderItemId, userId, false);
      this.typingTimers.delete(typingKey);
    }, WEBSOCKET_CONFIG.TYPING_TIMEOUT);

    this.typingTimers.set(typingKey, timer);
  }

  /**
   * Cria debounced sender para indicador de digitação
   */
  static createTypingSender(orderItemId: string, userId: string) {
    return WebSocketUtils.debounce(
      (isTyping: boolean) => this.sendTypingIndicator(orderItemId, userId, isTyping),
      500 // 500ms de debounce
    );
  }

  /**
   * Cria throttled sender para atualizações de presença
   */
  static createPresenceUpdater(orderItemId: string) {
    return WebSocketUtils.throttle(
      (presence: any) => this.updateUserPresence(orderItemId, presence),
      2000 // Máximo uma atualização a cada 2 segundos
    );
  }
}
