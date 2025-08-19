/**
 * Utilitários para WebSocket do chat
 */

import { WEBSOCKET_CONFIG, CHANNEL_PREFIX } from './config';
import { BroadcastChatMessage } from './types';

/**
 * Classe para utilitários do WebSocket
 */
export class WebSocketUtils {
  /**
   * Gera nome do canal baseado no orderItemId
   */
  static generateChannelName(orderItemId: string, isPrivate = false): string {
    const prefix = isPrivate ? CHANNEL_PREFIX.PRIVATE : CHANNEL_PREFIX.CHAT;
    return `${prefix}${orderItemId}`;
  }

  /**
   * Valida se a mensagem broadcast é válida
   */
  static validateBroadcastMessage(message: any): message is BroadcastChatMessage {
    return (
      message &&
      typeof message.id === 'string' &&
      typeof message.message === 'string' &&
      typeof message.sender_id === 'string' &&
      ['user', 'admin'].includes(message.sender_type) &&
      typeof message.created_at === 'string' &&
      typeof message.order_item_id === 'string' &&
      typeof message.order_id === 'string'
    );
  }

  /**
   * Cria delay para reconexão com backoff exponencial
   */
  static calculateReconnectDelay(attempt: number): number {
    return Math.min(
      WEBSOCKET_CONFIG.RECONNECT_INTERVAL * Math.pow(2, attempt),
      30000 // Máximo de 30 segundos
    );
  }

  /**
   * Debounce para indicadores de digitação
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle para limitar frequência de eventos
   */
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    
    return (...args: Parameters<T>) => {
      if (!lastRan) {
        func(...args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  /**
   * Formata timestamp para exibição
   */
  static formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toISOString();
  }

  /**
   * Gera ID único para mensagens temporárias
   */
  static generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
