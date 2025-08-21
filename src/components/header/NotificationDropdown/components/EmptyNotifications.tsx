/**
 * Componente para estado vazio de notificações
 * Responsabilidade única: Exibir mensagem quando não há notificações
 */

interface EmptyNotificationsProps {
  isLoading: boolean;
}

export function EmptyNotifications({ isLoading }: EmptyNotificationsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Carregando notificações...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v4m-6 8h2m-2 0v-2m0 2v2" 
          />
        </svg>
      </div>
      <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-2">
        Nenhuma notificação
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
        Você está em dia! Quando houver novidades, elas aparecerão aqui.
      </p>
    </div>
  );
}
