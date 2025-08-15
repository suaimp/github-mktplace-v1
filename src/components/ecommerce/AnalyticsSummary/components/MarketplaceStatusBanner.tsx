import { MarketplaceStatusConfig } from '../types/MarketplaceStatus';

interface MarketplaceStatusBannerProps {
  config: MarketplaceStatusConfig;
}

/**
 * Componente responsável por exibir banners de status do marketplace
 * Princípio de Responsabilidade Única: apenas exibição de mensagens de status
 */
export default function MarketplaceStatusBanner({ config }: MarketplaceStatusBannerProps) {
  const { isInTest, isInMaintenance, testMessage, maintenanceMessage } = config;

  // Se nenhum dos status estiver ativo, não renderizar nada
  if (!isInTest && !isInMaintenance) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Banner de Teste */}
      {isInTest && testMessage && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-yellow-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Modo de Teste Ativo
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>{testMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Manutenção */}
      {isInMaintenance && maintenanceMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-red-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Manutenção em Andamento
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{maintenanceMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
