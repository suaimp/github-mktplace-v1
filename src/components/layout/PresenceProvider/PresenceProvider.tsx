/**
 * Provider para gerenciar presença global do usuário
 * Responsabilidade única: Gerenciar presença do usuário logado em toda a aplicação
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useGlobalPresence } from '../../../pages/Orders/local-components/ChatModal/hooks/presence';
import { useLogoutWithPresence } from '../../../hooks/auth';

/**
 * Contexto de presença global
 */
interface PresenceContextType {
  isUserOnline: boolean;
  setUserOnline: () => Promise<void>;
  setUserOffline: () => Promise<void>;
  logout: () => Promise<void>;
  currentUserId: string | null;
}

const PresenceContext = createContext<PresenceContextType | null>(null);

/**
 * Props do Provider
 */
interface PresenceProviderProps {
  children: React.ReactNode;
}

/**
 * Provider de presença global
 */
export function PresenceProvider({ children }: PresenceProviderProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();

  // Hook de presença global
  const {
    setOnline,
    setOffline,
    isOnline
  } = useGlobalPresence({
    userId: currentUserId || '',
    userEmail,
    onPresenceChange: (event) => {
      console.log(`🔄 [PresenceProvider] Global presence changed:`, event);
    }
  });

  // Hook de logout com presença
  const { logout: logoutWithPresence } = useLogoutWithPresence({
    onLogoutComplete: () => {
      console.log(`✅ [PresenceProvider] Logout completed`);
      setCurrentUserId(null);
      setUserEmail(undefined);
    },
    onError: (error) => {
      console.error(`❌ [PresenceProvider] Logout error:`, error);
    }
  });

  /**
   * Monitora mudanças de autenticação
   */
  useEffect(() => {
    // Verificar usuário atual
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log(`👤 [PresenceProvider] User authenticated:`, { id: user.id, email: user.email });
        setCurrentUserId(user.id);
        setUserEmail(user.email);
      } else {
        console.log(`👤 [PresenceProvider] No user authenticated`);
        setCurrentUserId(null);
        setUserEmail(undefined);
      }
    };

    getCurrentUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔐 [PresenceProvider] Auth state changed:`, { event, userId: session?.user?.id });
        
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUserId(session.user.id);
          setUserEmail(session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUserId(null);
          setUserEmail(undefined);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Contexto value
   */
  const contextValue: PresenceContextType = {
    isUserOnline: isOnline,
    setUserOnline: setOnline,
    setUserOffline: setOffline,
    logout: logoutWithPresence,
    currentUserId
  };

  return (
    <PresenceContext.Provider value={contextValue}>
      {children}
    </PresenceContext.Provider>
  );
}

/**
 * Hook para usar contexto de presença
 */
export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence deve ser usado dentro de PresenceProvider');
  }
  return context;
}
