/**
 * Hook para presença global do usuário
 * Responsabilidade única: Gerenciar status de presença do usuário atual
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { UserPresenceService } from '../../../../../../db-service/user-presence';
import { UseGlobalPresenceProps, UseGlobalPresenceReturn, PresenceStatus } from './types';

/**
 * Hook para gerenciar presença global do usuário
 */
export function useGlobalPresence({
  userId,
  userEmail,
  onPresenceChange
}: UseGlobalPresenceProps): UseGlobalPresenceReturn {
  const [currentStatus, setCurrentStatus] = useState<PresenceStatus>('offline');
  const [isOnline, setIsOnline] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Define usuário como online
   */
  const setOnline = useCallback(async () => {
    console.log(`🟢 [GlobalPresence] Setting user online:`, { userId, userEmail });
    
    try {
      const success = await UserPresenceService.setUserOnline(userId, userEmail);
      
      if (success) {
        setCurrentStatus('online');
        setIsOnline(true);
        
        onPresenceChange?.({
          userId,
          status: 'online',
          timestamp: new Date().toISOString(),
          orderItemId: 'global'
        });

        console.log(`✅ [GlobalPresence] User set online successfully`);
      }
    } catch (error) {
      console.error(`❌ [GlobalPresence] Error setting user online:`, error);
    }
  }, [userId, userEmail, onPresenceChange]);

  /**
   * Define usuário como offline
   */
  const setOffline = useCallback(async () => {
    console.log(`🔴 [GlobalPresence] Setting user offline:`, { userId });
    
    try {
      const success = await UserPresenceService.setUserOffline(userId);
      
      if (success) {
        setCurrentStatus('offline');
        setIsOnline(false);
        
        onPresenceChange?.({
          userId,
          status: 'offline',
          timestamp: new Date().toISOString(),
          orderItemId: 'global'
        });

        console.log(`✅ [GlobalPresence] User set offline successfully`);
      }
    } catch (error) {
      console.error(`❌ [GlobalPresence] Error setting user offline:`, error);
    }
  }, [userId, onPresenceChange]);

  /**
   * Define usuário como digitando
   */
  const setTyping = useCallback(async () => {
    try {
      const success = await UserPresenceService.setUserTyping(userId);
      
      if (success) {
        setCurrentStatus('typing');
        
        onPresenceChange?.({
          userId,
          status: 'typing',
          timestamp: new Date().toISOString(),
          orderItemId: 'global'
        });
      }
    } catch (error) {
      console.error(`❌ [GlobalPresence] Error setting user typing:`, error);
    }
  }, [userId, onPresenceChange]);

  /**
   * Define usuário como idle
   */
  const setIdle = useCallback(async () => {
    try {
      const success = await UserPresenceService.setUserIdle(userId);
      
      if (success) {
        setCurrentStatus('idle');
        
        onPresenceChange?.({
          userId,
          status: 'idle',
          timestamp: new Date().toISOString(),
          orderItemId: 'global'
        });
      }
    } catch (error) {
      console.error(`❌ [GlobalPresence] Error setting user idle:`, error);
    }
  }, [userId, onPresenceChange]);

  /**
   * Heartbeat para manter presença ativa
   */
  const startHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (currentStatus === 'online') {
        await UserPresenceService.setUserOnline(userId, userEmail);
        console.log(`💓 [GlobalPresence] Heartbeat sent for user ${userId}`);
      }
    }, 30000); // A cada 30 segundos
  }, [userId, userEmail, currentStatus]);

  /**
   * Para o heartbeat
   */
  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Cleanup ao sair
   */
  const cleanup = useCallback(async () => {
    console.log(`🧹 [GlobalPresence] Cleaning up presence for user ${userId}`);
    stopHeartbeat();
    await setOffline();
  }, [userId, setOffline, stopHeartbeat]);

  // Configurar presença inicial quando usuário está logado
  useEffect(() => {
    if (userId) {
      setOnline();
      startHeartbeat();
    }

    return () => {
      cleanup();
    };
  }, [userId]); // Removemos outras dependências para evitar loops

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Listener para quando a aba/janela fecha
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Não podemos usar async aqui, então fazemos sync
      navigator.sendBeacon('/api/user-offline', JSON.stringify({ userId }));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIdle();
      } else if (currentStatus === 'idle') {
        setOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, currentStatus, setOnline, setIdle]);

  return {
    setOnline,
    setOffline,
    setTyping,
    setIdle,
    currentStatus,
    isOnline
  };
}
