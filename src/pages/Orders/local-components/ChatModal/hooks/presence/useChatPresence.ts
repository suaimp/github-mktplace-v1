/**
 * Hook para presença de usuários no chat
 * Responsabilidade única: Gerenciar presença de outros usuários em um chat específico
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UserPresence } from '../../../../../../db-service/order-chat';
import { UserPresenceService } from '../../../../../../db-service/user-presence';
import { UseChatPresenceProps, UseChatPresenceReturn } from './types';

/**
 * Hook para gerenciar presença no chat
 */
export function useChatPresence({
  orderItemId,
  onlineUsers = [],
  onPresenceUpdate
}: UseChatPresenceProps): UseChatPresenceReturn {
  const [otherUsersOnline, setOtherUsersOnline] = useState<UserPresence[]>([]);

  /**
   * Atualiza lista de usuários online
   */
  const updateOnlineUsers = useCallback((users: UserPresence[]) => {
    console.log(`👥 [ChatPresence] Updating online users:`, {
      orderItemId,
      usersCount: users.length,
      users: users.map(u => ({ userId: u.userId, status: u.status }))
    });

    setOtherUsersOnline(users);
    onPresenceUpdate?.(users);
  }, [orderItemId, onPresenceUpdate]);

  /**
   * Verifica se outros usuários estão online
   */
  const isOtherUserOnline = useMemo(() => {
    const onlineCount = otherUsersOnline.filter(user => 
      user.status === 'online' || user.status === 'typing'
    ).length;
    
    return onlineCount > 0;
  }, [otherUsersOnline]);

  /**
   * Conta usuários online
   */
  const otherUsersCount = useMemo(() => {
    return otherUsersOnline.filter(user => 
      user.status === 'online' || user.status === 'typing'
    ).length;
  }, [otherUsersOnline]);

  /**
   * Busca usuários online para o chat
   */
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const onlineUsersData = await UserPresenceService.getOnlineUsersForChat(orderItemId);
      
      // Converte para formato esperado
      const convertedUsers: UserPresence[] = onlineUsersData.map(user => ({
        userId: user.user_id,
        email: user.email,
        online_at: user.online_at || user.last_seen,
        status: user.status as 'online' | 'typing' | 'idle'
      }));

      updateOnlineUsers(convertedUsers);
    } catch (error) {
      console.error(`❌ [ChatPresence] Error fetching online users:`, error);
    }
  }, [orderItemId, updateOnlineUsers]);

  /**
   * Atualiza presença quando prop onlineUsers muda
   */
  useEffect(() => {
    if (onlineUsers && onlineUsers.length >= 0) {
      updateOnlineUsers(onlineUsers);
    }
  }, [onlineUsers, updateOnlineUsers]);

  /**
   * Busca inicial e setup de polling
   */
  useEffect(() => {
    // Busca inicial
    fetchOnlineUsers();

    // Polling periódico para sincronizar presença
    const interval = setInterval(() => {
      fetchOnlineUsers();
    }, 10000); // A cada 10 segundos

    return () => {
      clearInterval(interval);
    };
  }, [fetchOnlineUsers]);

  return {
    otherUsersOnline,
    isOtherUserOnline,
    otherUsersCount
  };
}
