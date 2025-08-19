/**
 * Hook para logout com gerenciamento de presença
 * Responsabilidade única: Gerenciar logout e limpeza de presença
 */

import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPresenceService } from '../../db-service/user-presence';

/**
 * Props para hook de logout
 */
export interface UseLogoutWithPresenceProps {
  onLogoutComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Retorno do hook de logout
 */
export interface UseLogoutWithPresenceReturn {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

/**
 * Hook para logout com limpeza de presença
 */
export function useLogoutWithPresence({
  onLogoutComplete,
  onError
}: UseLogoutWithPresenceProps = {}): UseLogoutWithPresenceReturn {
  
  /**
   * Executa logout completo
   */
  const logout = useCallback(async () => {
    console.log(`🚪 [Logout] Starting logout process`);
    
    try {
      // 1. Obter dados do usuário antes do logout
      const { data: user } = await supabase.auth.getUser();
      const userId = user?.user?.id;

      if (userId) {
        console.log(`🔴 [Logout] Setting user offline:`, { userId });
        
        // 2. Definir usuário como offline em todos os chats
        await UserPresenceService.setUserOffline(userId);
        
        // 3. Opcionalmente, remover presença completamente
        // await UserPresenceService.removeUserPresence(userId);
      }

      // 4. Executar logout do Supabase
      console.log(`🚪 [Logout] Signing out from Supabase`);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(`Erro no logout: ${error.message}`);
      }

      console.log(`✅ [Logout] Logout completed successfully`);
      onLogoutComplete?.();

    } catch (error) {
      console.error(`❌ [Logout] Logout failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no logout';
      onError?.(errorMessage);
    }
  }, [onLogoutComplete, onError]);

  return {
    logout,
    isLoggingOut: false // Podemos implementar loading state se necessário
  };
}
