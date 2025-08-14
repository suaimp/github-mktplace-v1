import { useState, useEffect } from 'react';
import { 
  MarketplaceModeService, 
  MarketplaceModeSettings
} from '../../../services/db-services/settings-services/marketplaceModeService';
import { useSettingsToast } from './useSettingsToast';

export interface UseMarketplaceModeReturn {
  settings: MarketplaceModeSettings | null;
  loading: boolean;
  isTestMode: boolean;
  isMaintenanceMode: boolean;
  testMessage: string;
  maintenanceMessage: string;
  toggleTestMode: (enabled: boolean) => Promise<void>;
  toggleMaintenanceMode: (enabled: boolean) => Promise<void>;
  updateTestMessage: (message: string) => Promise<void>;
  updateMaintenanceMessage: (message: string) => Promise<void>;
  loadSettings: () => Promise<void>;
}

/**
 * Hook para gerenciar configurações de modo do marketplace
 */
export const useMarketplaceMode = (): UseMarketplaceModeReturn => {
  const [settings, setSettings] = useState<MarketplaceModeSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const { showSuccessToast, showErrorToast } = useSettingsToast();

  // Carrega as configurações iniciais
  useEffect(() => {
    loadSettings();
  }, []);

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
        setTestMessage('O marketplace está em modo de teste. Algumas funcionalidades podem não estar disponíveis.');
        setMaintenanceMessage('O marketplace está temporariamente em manutenção. Tente novamente em alguns minutos.');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de marketplace mode:', error);
      showErrorToast('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const toggleTestMode = async (enabled: boolean) => {
    try {
      setLoading(true);
      
      const success = await MarketplaceModeService.toggleTestMode(enabled, testMessage);
      
      if (success) {
        setIsTestMode(enabled);
        showSuccessToast('Modo de teste atualizado com sucesso');
        await loadSettings(); // Recarrega para sincronizar
      } else {
        showErrorToast('Erro ao atualizar modo de teste');
      }
    } catch (error) {
      console.error('Erro ao alterar modo de teste:', error);
      showErrorToast('Erro ao atualizar modo de teste');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    try {
      setLoading(true);
      
      const success = await MarketplaceModeService.toggleMaintenanceMode(enabled, maintenanceMessage);
      
      if (success) {
        setIsMaintenanceMode(enabled);
        showSuccessToast('Modo de manutenção atualizado com sucesso');
        await loadSettings(); // Recarrega para sincronizar
      } else {
        showErrorToast('Erro ao atualizar modo de manutenção');
      }
    } catch (error) {
      console.error('Erro ao alterar modo de manutenção:', error);
      showErrorToast('Erro ao atualizar modo de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const updateTestMessage = async (message: string) => {
    try {
      setLoading(true);
      
      const success = await MarketplaceModeService.updateTestMessage(message);
      
      if (success) {
        setTestMessage(message);
        showSuccessToast('Mensagem de teste atualizada com sucesso');
      } else {
        showErrorToast('Erro ao atualizar mensagem de teste');
      }
    } catch (error) {
      console.error('Erro ao atualizar mensagem de teste:', error);
      showErrorToast('Erro ao atualizar mensagem de teste');
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenanceMessage = async (message: string) => {
    try {
      setLoading(true);
      
      const success = await MarketplaceModeService.updateMaintenanceMessage(message);
      
      if (success) {
        setMaintenanceMessage(message);
        showSuccessToast('Mensagem de manutenção atualizada com sucesso');
      } else {
        showErrorToast('Erro ao atualizar mensagem de manutenção');
      }
    } catch (error) {
      console.error('Erro ao atualizar mensagem de manutenção:', error);
      showErrorToast('Erro ao atualizar mensagem de manutenção');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    isTestMode,
    isMaintenanceMode,
    testMessage,
    maintenanceMessage,
    toggleTestMode,
    toggleMaintenanceMode,
    updateTestMessage,
    updateMaintenanceMessage,
    loadSettings
  };
};
