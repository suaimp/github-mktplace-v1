/**
 * Simple authentication hook for getting current user
 * Compatible with existing admin verification patterns
 */

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  console.log('🔐 [useAuth] Hook inicializado');

  useEffect(() => {
    async function initializeAuth() {
      console.log('🚀 [useAuth] Iniciando verificação de autenticação');
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        console.log('👤 [useAuth] Usuário obtido:', {
          userId: currentUser?.id,
          email: currentUser?.email,
          hasUser: !!currentUser
        });
        setUser(currentUser);

        if (currentUser) {
          console.log('🔍 [useAuth] Verificando se usuário é admin');
          // Check if user is admin
          const { data: adminRole } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "admin")
            .maybeSingle();

          console.log('📋 [useAuth] Role admin:', adminRole);

          if (adminRole?.id) {
            console.log('🔍 [useAuth] Verificando na tabela admins');
            // Check admins table first
            const { data: adminData } = await supabase
              .from("admins")
              .select("role, role_id")
              .eq("id", currentUser.id)
              .maybeSingle();

            console.log('👥 [useAuth] Dados da tabela admins:', adminData);

            if (adminData?.role === "admin" && adminData.role_id === adminRole.id) {
              console.log('✅ [useAuth] Usuário é admin (tabela admins)');
              setIsAdmin(true);
            } else {
              console.log('🔍 [useAuth] Verificando na tabela platform_users');
              // Check platform_users table as fallback
              const { data: platformData } = await supabase
                .from("platform_users")
                .select("role, role_id")
                .eq("id", currentUser.id)
                .maybeSingle();

              console.log('👥 [useAuth] Dados da tabela platform_users:', platformData);

              if (platformData?.role === "admin" && platformData.role_id === adminRole.id) {
                console.log('✅ [useAuth] Usuário é admin (tabela platform_users)');
                setIsAdmin(true);
              } else {
                console.log('❌ [useAuth] Usuário NÃO é admin');
              }
            }
          } else {
            console.log('❌ [useAuth] Role admin não encontrado');
          }
        } else {
          console.log('👤 [useAuth] Nenhum usuário logado');
        }
      } catch (error) {
        console.error('💥 [useAuth] Erro ao verificar autenticação:', error);
      } finally {
        console.log('🏁 [useAuth] Verificação concluída');
        setLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [useAuth] Auth state change:', event);
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
        } else if (session?.user) {
          setUser(session.user);
          // Re-check admin status when user signs in
          initializeAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log('📊 [useAuth] Estado atual:', { 
    hasUser: !!user, 
    isAdmin, 
    loading,
    userId: user?.id 
  });

  return { user, loading, isAdmin };
}
