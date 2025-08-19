/**
 * Hook para presença de usuários
 * Responsabilidade única: Gerenciar presença online de usuários
 */

import { useState, useCallback } from 'react';
import { OrderChatWebSocketService, UserPresence } from '../../../../../../db-service/order-chat';
import { UseUserPresenceProps } from './types';

/**
 * Hook para gerenciar presença de usuários
 */
export function useUserPresence({
  orderItemId,
  userId,
  userEmail,
  onPresenceChange
}: UseUserPresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [userStatus, setUserStatus] = useState<'online' | 'typing' | 'idle'>('online');

  /**
   * Cria updater throttled para presença
   */
  const presenceUpdater = useCallback(
    OrderChatWebSocketService.createPresenceUpdater(orderItemId),
    [orderItemId]
  );

  /**
   * Atualiza status do usuário atual
   */
  const updateUserStatus = useCallback((status: 'online' | 'typing' | 'idle') => {
    setUserStatus(status);
    presenceUpdater({
      userId,
      email: userEmail,
      status
    });
  }, [userId, userEmail, presenceUpdater]);

  /**
   * Atualiza lista de usuários online
   */
  const updateOnlineUsers = useCallback((users: UserPresence[]) => {
    setOnlineUsers(users);
    onPresenceChange?.(users);
  }, [onPresenceChange]);

  /**
   * Marca usuário como online
   */
  const setOnline = useCallback(() => {
    updateUserStatus('online');
  }, [updateUserStatus]);

  /**
   * Marca usuário como digitando
   */
  const setTyping = useCallback(() => {
    updateUserStatus('typing');
  }, [updateUserStatus]);

  /**
   * Marca usuário como inativo
   */
  const setIdle = useCallback(() => {
    updateUserStatus('idle');
  }, [updateUserStatus]);

  /**
   * Obtém contagem de usuários online (exceto o atual)
   */
  const onlineCount = onlineUsers.filter(user => user.userId !== userId).length;

  /**
   * Verifica se usuário específico está online
   */
  const isUserOnline = useCallback((targetUserId: string): boolean => {
    return onlineUsers.some(user => user.userId === targetUserId);
  }, [onlineUsers]);

  return {
    onlineUsers,
    userStatus,
    onlineCount,
    setOnline,
    setTyping,
    setIdle,
    updateOnlineUsers,
    isUserOnline
  };
}
