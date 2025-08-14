import { useState, useEffect } from 'react';
import { MarketplaceModeService, MarketplaceModeSettings } from '../../../services/db-services/settings-services/marketplaceModeService';

export interface UseMarketplaceStatusReturn {
  settings: MarketplaceModeSettings | null;
  loading: boolean;
  isTestMode: boolean;
  isMaintenanceMode: boolean;
  testMessage: string;
  maintenanceMessage: string;
  refreshSettings: () => Promise<void>;
}

/**
 * Hook para verificar o status atual do marketplace (apenas leitura)
 * Usado em páginas públicas como login para mostrar avisos
 */
export const useMarketplaceStatus = (): UseMarketplaceStatusReturn => {
  const [settings, setSettings] = useState<MarketplaceModeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const settingsData = await MarketplaceModeService.getMarketplaceModeSettings();
      
      if (settingsData) {
        setSettings(settingsData);
        setIsTestMode(settingsData.marketplace_in_test || false);
        setIsMaintenanceMode(settingsData.marketplace_in_maintenance || false);
        setTestMessage(settingsData.marketplace_test_message || '');
        setMaintenanceMessage(settingsData.marketplace_maintenance_message || '');
      } else {
        // Valores padrão se não encontrar configurações
        setIsTestMode(false);
        setIsMaintenanceMode(false);
        setTestMessage('');
        setMaintenanceMessage('');
      }
    } catch (error) {
      console.error('Erro ao carregar status do marketplace:', error);
      // Em caso de erro, assumir que não há modos ativos
      setIsTestMode(false);
      setIsMaintenanceMode(false);
      setTestMessage('');
      setMaintenanceMessage('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return {
    settings,
    loading,
    isTestMode,
    isMaintenanceMode,
    testMessage,
    maintenanceMessage,
    refreshSettings
  };
};
