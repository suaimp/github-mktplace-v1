/**
 * Hook para indicadores de digitação
 * Responsabilidade única: Gerenciar indicadores de digitação
 */

import { useState, useCallback } from 'react';
import { OrderChatWebSocketService } from '../../../../../../db-service/order-chat';
import { UseTypingIndicatorProps } from './types';

/**
 * Hook para gerenciar indicadores de digitação
 */
export function useTypingIndicator({
  orderItemId,
  userId,
  onTypingChange
}: UseTypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Cria sender throttled para digitação
   */
  const typingSender = useCallback(
    OrderChatWebSocketService.createTypingSender(orderItemId, userId),
    [orderItemId, userId]
  );

  /**
   * Inicia indicador de digitação
   */
  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      typingSender(true);
    }
  }, [isTyping, typingSender]);

  /**
   * Para indicador de digitação
   */
  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      typingSender(false);
    }
  }, [isTyping, typingSender]);

  /**
   * Atualiza lista de usuários digitando
   */
  const updateTypingUsers = useCallback((users: string[]) => {
    setTypingUsers(users);
    onTypingChange?.(users);
  }, [onTypingChange]);

  /**
   * Indica se outros usuários estão digitando
   */
  const othersTyping = typingUsers.filter(id => id !== userId);

  return {
    typingUsers,
    othersTyping,
    isTyping,
    startTyping,
    stopTyping,
    updateTypingUsers
  };
}
