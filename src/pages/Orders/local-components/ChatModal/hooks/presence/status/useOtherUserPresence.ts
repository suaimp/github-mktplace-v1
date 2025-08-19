/**
 * Hook para gerenciar status de presença do outro usuário
 * Responsabilidade única: Gerenciar estado e carregamento do status de presença
 */

import { useState, useEffect, useCallback } from 'react';
import { UserPresenceStatus } from '../../../components/presence';
import { UserPresenceService } from '../../../../../../../db-service/user-presence';
import { supabase } from '../../../../../../../lib/supabase';

interface UseOtherUserPresenceProps {
  orderItemId: string;
  isConnected: boolean;
  refreshInterval?: number;
}

interface UseOtherUserPresenceReturn {
  presenceStatus: UserPresenceStatus;
  refreshPresence: () => Promise<void>;
  isOtherUserOnline: boolean;
  currentUserId?: string;
}

export function useOtherUserPresence({
  orderItemId,
  isConnected,
  refreshInterval = 30000 // 30 segundos
}: UseOtherUserPresenceProps): UseOtherUserPresenceReturn {
  
  const [presenceStatus, setPresenceStatus] = useState<UserPresenceStatus>({
    isOnline: false,
    isLoading: true,
    userName: undefined,
    lastSeen: undefined
  });
  
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  /**
   * Atualiza o status de presença do outro usuário
   */
  const refreshPresence = useCallback(async () => {
    if (!isConnected || !orderItemId) {
      setPresenceStatus(prev => ({
        ...prev,
        isLoading: false,
        isOnline: false
      }));
      return;
    }

    try {
      // Obtém usuário atual se não tiver
      let userId = currentUserId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        setCurrentUserId(userId);
      }

      // Busca usuários online no chat atual
      const onlineUsers = await UserPresenceService.getOnlineUsersForChat(orderItemId);
      
      // Filtra outros usuários (exclui o usuário atual)
      const otherUsers = userId 
        ? onlineUsers.filter(user => user.user_id !== userId)
        : onlineUsers;

      if (otherUsers.length > 0) {
        const otherUser = otherUsers[0]; // Pega o primeiro outro usuário
        setPresenceStatus({
          isOnline: true,
          isLoading: false,
          userName: otherUser.email?.split('@')[0] || 'Usuário',
          lastSeen: new Date(otherUser.last_seen)
        });
      } else {
        setPresenceStatus({
          isOnline: false,
          isLoading: false,
          userName: 'Usuário',
          lastSeen: undefined
        });
      }

    } catch (error) {
      console.error('Erro ao verificar presença:', error);
      setPresenceStatus({
        isOnline: false,
        isLoading: false,
        userName: 'Usuário',
        lastSeen: undefined
      });
    }
  }, [orderItemId, currentUserId, isConnected]);

  /**
   * Efeito para carregar presença inicial e configurar polling
   */
  useEffect(() => {
    if (!isConnected) {
      setPresenceStatus(prev => ({
        ...prev,
        isLoading: false,
        isOnline: false
      }));
      return;
    }

    // Carrega presença inicial
    setPresenceStatus(prev => ({ ...prev, isLoading: true }));
    refreshPresence();

    // Configura polling para atualizações periódicas
    const interval = setInterval(refreshPresence, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [refreshPresence, isConnected, refreshInterval]);

  return {
    presenceStatus,
    refreshPresence,
    isOtherUserOnline: presenceStatus.isOnline && isConnected,
    currentUserId
  };
}
