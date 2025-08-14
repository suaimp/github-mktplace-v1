import { useMarketplaceStatus } from '../hooks/useMarketplaceStatus';

/**
 * Componente para exibir avisos de modo do marketplace
 * Mostra mensagens quando o marketplace está em teste ou manutenção
 */
export default function MarketplaceStatusBanner() {
  const { 
    loading, 
    isTestMode, 
    isMaintenanceMode, 
    testMessage, 
    maintenanceMessage 
  } = useMarketplaceStatus();

  // Não renderizar se estiver carregando ou não há modos ativos
  if (loading || (!isTestMode && !isMaintenanceMode)) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Banner de Modo de Manutenção */}
      {isMaintenanceMode && maintenanceMessage && (
        <div className="px-4 py-3 text-sm font-medium text-red-800 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <svg 
              className="w-5 h-5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>{maintenanceMessage}</span>
          </div>
        </div>
      )}

      {/* Banner de Modo de Teste */}
      {isTestMode && testMessage && (
        <div className="px-4 py-3 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <svg 
              className="w-5 h-5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>{testMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
