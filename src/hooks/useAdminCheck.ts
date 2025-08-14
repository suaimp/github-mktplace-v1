import { useState, useEffect } from 'react';
import { AdminService } from '../services/auth/AdminService';
import { AdminCheckResult } from '../types/admin';

/**
 * Hook para verificar se o usuário atual é admin
 * Princípio da Responsabilidade Única: Apenas gerencia estado da verificação de admin
 * Princípio da Dependência: Delega a lógica para AdminService
 */
export function useAdminCheck(): AdminCheckResult {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function checkAdminStatus() {
      setLoading(true);
      setError(undefined);
      
      try {
        console.log('🔍 [useAdminCheck] Iniciando verificação de admin...');
        
        const result = await AdminService.isCurrentUserAdmin();
        
        console.log(`${result ? '✅' : '❌'} [useAdminCheck] Resultado: ${result ? 'É admin' : 'Não é admin'}`);
        
        setIsAdmin(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('❌ [useAdminCheck] Erro:', errorMessage);
        setError(errorMessage);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  return { isAdmin, loading, error };
}
