import { useState, useEffect, useCallback } from 'react';
import { MarketplaceStatusHookReturn, MarketplaceStatusConfig } from '../types/MarketplaceStatus';
import { MarketplaceModeService } from '../../../../services/db-services/settings-services/marketplaceModeService';

/**
 * Hook customizado para gerenciar o status do marketplace
 * Princípio de Responsabilidade Única: apenas lógica de estado e fetching de configurações de marketplace
 */
export function useMarketplaceStatus(): MarketplaceStatusHookReturn {
  const [config, setConfig] = useState<MarketplaceStatusConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega as configurações de status do marketplace
   */
  const loadMarketplaceStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const settings = await MarketplaceModeService.getMarketplaceModeSettings();
      
      if (settings) {
        setConfig({
          isInTest: settings.marketplace_in_test,
          isInMaintenance: settings.marketplace_in_maintenance,
          testMessage: settings.marketplace_test_message,
          maintenanceMessage: settings.marketplace_maintenance_message
        });
      } else {
        // Valores padrão se não houver configurações
        setConfig({
          isInTest: false,
          isInMaintenance: false,
          testMessage: null,
          maintenanceMessage: null
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar configurações do marketplace';
      setError(errorMessage);
      console.error('Erro ao carregar configurações do marketplace:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Função para recarregar as configurações
   */
  const refetch = useCallback(async () => {
    await loadMarketplaceStatus();
  }, [loadMarketplaceStatus]);

  // Carregar configurações iniciais
  useEffect(() => {
    loadMarketplaceStatus();
  }, [loadMarketplaceStatus]);

  return {
    config,
    isLoading,
    error,
    refetch
  };
}
