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

 
  useEffect(() => {
    async function initializeAuth() {
       try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Check if user is admin
          const { data: adminRole } = await supabase
            .from("roles")
            .select("id")
            .eq("name", "admin")
            .maybeSingle();


          if (adminRole?.id) {
            // Check admins table first
            const { data: adminData } = await supabase
              .from("admins")
              .select("role, role_id")
              .eq("id", currentUser.id)
              .maybeSingle();


            if (adminData?.role === "admin" && adminData.role_id === adminRole.id) {
              setIsAdmin(true);
            } else {
              // Check platform_users table as fallback
              const { data: platformData } = await supabase
                .from("platform_users")
                .select("role, role_id")
                .eq("id", currentUser.id)
                .maybeSingle();


              if (platformData?.role === "admin" && platformData.role_id === adminRole.id) {
                setIsAdmin(true);
              } else {
              }
            }
          } else {
          }
        } else {
        }
      } catch (error) {
        console.error('💥 [useAuth] Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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


  return { user, loading, isAdmin };
}
