import { useState, useEffect } from 'react';
import { useMarketplaceStatus } from './useMarketplaceStatus';

export interface UseLoginFlowReturn {
  isLoading: boolean;
  isMaintenanceMode: boolean;
  shouldShowForm: (isAdminLogin: boolean) => boolean;
}

/**
 * Hook responsável pela lógica de fluxo do login
 * Gerencia quando mostrar formulário baseado no status de manutenção
 */
export const useLoginFlow = (): UseLoginFlowReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const { loading: marketplaceLoading, isMaintenanceMode } = useMarketplaceStatus();

  useEffect(() => {
    // Aguarda o marketplace status ser carregado
    if (!marketplaceLoading) {
      setIsLoading(false);
    }
  }, [marketplaceLoading]);

  const shouldShowForm = (isAdminLogin: boolean): boolean => {
    // Admin sempre pode ver o formulário
    if (isAdminLogin) return true;
    
    // Usuário comum só vê se não estiver em manutenção
    return !isMaintenanceMode;
  };

  return {
    isLoading,
    isMaintenanceMode,
    shouldShowForm
  };
};
