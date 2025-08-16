import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useMarketplaceStatus } from './useMarketplaceStatus';
import { LoginInitializationState } from '../interfaces/LoginStates';

/**
 * Hook responsável por gerenciar a inicialização do componente de login
 * Verifica se deve exibir o formulário baseado no modo de manutenção
 * Seguindo o princípio da Responsabilidade Única (SRP)
 */
export const useLoginInitialization = (): LoginInitializationState => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldShowForm, setShouldShowForm] = useState(false);
  const location = useLocation();
  const { isMaintenanceMode, loading: statusLoading } = useMarketplaceStatus();

  // Determina se é a página de login administrativo
  const isAdminLogin = location.pathname === "/adm";

  useEffect(() => {
    // Aguarda o carregamento do status do marketplace
    if (!statusLoading) {
      // Lógica para determinar se deve exibir o formulário
      const shouldShow = isAdminLogin || !isMaintenanceMode;
      
      setShouldShowForm(shouldShow);
      setIsInitializing(false);
    }
  }, [statusLoading, isMaintenanceMode, isAdminLogin]);

  return {
    isInitializing,
    shouldShowForm,
    isMaintenanceMode: isMaintenanceMode && !isAdminLogin
  };
};
