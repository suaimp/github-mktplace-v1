import { useCallback } from 'react';
import { useAdminCheck } from './useAdminCheck';
import { AdminService } from '../services/auth/AdminService';
import { AdminUtils } from '../utils/adminUtils';

/**
 * Hook específico para componentes que precisam de funcionalidades de admin
 * Princípio da Responsabilidade Única: Focado em operações de admin para componentes
 */
export function useAdminOperations() {
  const { isAdmin, loading, error } = useAdminCheck();

  /**
   * Verifica se pode executar uma operação de admin
   */
  const canPerformAdminAction = useCallback((): boolean => {
    return isAdmin && !loading && !error;
  }, [isAdmin, loading, error]);

  /**
   * Executa uma ação apenas se for admin
   */
  const executeIfAdmin = useCallback(
    async <T>(action: () => Promise<T> | T): Promise<T | null> => {
      if (!canPerformAdminAction()) {
        console.warn('Tentativa de executar ação de admin sem permissão');
        return null;
      }

      try {
        return await action();
      } catch (err) {
        console.error('Erro ao executar ação de admin:', err);
        throw err;
      }
    },
    [canPerformAdminAction]
  );

  /**
   * Força uma nova verificação de admin
   */
  const refreshAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Limpa o cache
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
      if (user) {
        AdminUtils.clearAdminCache(user.id);
      }
      
      // Força nova verificação
      return await AdminService.isCurrentUserAdmin();
    } catch (error) {
      console.error('Erro ao atualizar status de admin:', error);
      return false;
    }
  }, []);

  return {
    isAdmin,
    loading,
    error,
    canPerformAdminAction,
    executeIfAdmin,
    refreshAdminStatus,
  };
}
