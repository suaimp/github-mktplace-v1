import Switch from '../../../components/form/switch/Switch';
import { useMarketplaceMode } from '../hooks/useMarketplaceMode';
import MarketplaceModeMessageField from './MarketplaceModeMessageField';

/**
 * Componente para configurações de modo do marketplace (teste e manutenção)
 */
export default function MarketplaceModeSettings() {
  const {
    loading,
    isTestMode,
    isMaintenanceMode,
    testMessage,
    maintenanceMessage,
    toggleTestMode,
    toggleMaintenanceMode,
    updateTestMessage,
    updateMaintenanceMessage
  } = useMarketplaceMode();

  const handleTestModeChange = async (enabled: boolean) => {
    await toggleTestMode(enabled);
  };

  const handleMaintenanceModeChange = async (enabled: boolean) => {
    await toggleMaintenanceMode(enabled);
  };

  const handleTestMessageChange = () => {
    // A mudança local é gerenciada pelo componente MarketplaceModeMessageField
  };

  const handleMaintenanceMessageChange = () => {
    // A mudança local é gerenciada pelo componente MarketplaceModeMessageField
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Modos do Marketplace
        </h3>

        {/* Modo de Teste */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Switch
              label="Modo de Teste"
              checked={isTestMode}
              onChange={handleTestModeChange}
              disabled={loading}
            />
          </div>

          {/* Campo de mensagem do modo de teste - aparece quando ativado */}
          {isTestMode && (
            <div className="ml-4 pl-4 border-l-2 border-yellow-200 dark:border-yellow-800">
              <MarketplaceModeMessageField
                label="Mensagem do Modo de Teste"
                placeholder="Digite a mensagem que será exibida quando o marketplace estiver em modo de teste..."
                value={testMessage}
                onChange={handleTestMessageChange}
                onSave={updateTestMessage}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Modo de Manutenção */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Switch
              label="Modo de Manutenção"
              checked={isMaintenanceMode}
              onChange={handleMaintenanceModeChange}
              disabled={loading}
            />
          </div>

          {/* Campo de mensagem do modo de manutenção - aparece quando ativado */}
          {isMaintenanceMode && (
            <div className="ml-4 pl-4 border-l-2 border-red-200 dark:border-red-800">
              <MarketplaceModeMessageField
                label="Mensagem do Modo de Manutenção"
                placeholder="Digite a mensagem que será exibida quando o marketplace estiver em manutenção..."
                value={maintenanceMessage}
                onChange={handleMaintenanceMessageChange}
                onSave={updateMaintenanceMessage}
                disabled={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
