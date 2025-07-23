import type { ArticleDeletionResult } from "../services/OrderDeletionService";

interface OrderDeletionNotificationProps {
  isVisible: boolean;
  result: ArticleDeletionResult | null;
  onClose: () => void;
}

/**
 * Componente de notificação específico para exibir resultados da exclusão de pedidos
 * Mostra detalhes sobre arquivos excluídos com sucesso e falhas
 */
export function OrderDeletionNotification({
  isVisible,
  result,
  onClose,
}: OrderDeletionNotificationProps) {
  if (!isVisible || !result) {
    return null;
  }

  const hasFailures = result.failedFiles.length > 0;
  const hasSuccesses = result.deletedFiles.length > 0;

  return (
    <div className="fixed top-20 right-8 z-50 max-w-md w-full">
      <div
        className={`rounded-lg border p-4 shadow-lg bg-white dark:bg-gray-800 ${
          result.success
            ? "border-green-200 dark:border-green-800"
            : "border-yellow-200 dark:border-yellow-800"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                result.success
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {result.success ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              )}
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {result.success ? "Exclusão Concluída" : "Exclusão com Avisos"}
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {hasSuccesses && (
          <div className="mb-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ {result.deletedFiles.length} arquivo(s) excluído(s) com sucesso
            </p>
            {result.deletedFiles.length <= 3 && (
              <ul className="mt-1 text-xs text-gray-600 dark:text-gray-400 ml-4">
                {result.deletedFiles.map((file, index) => (
                  <li key={index} className="truncate">
                    • {file.split("/").pop()} {/* Mostra apenas o nome do arquivo */}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Failure Message */}
        {hasFailures && (
          <div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⚠️ {result.failedFiles.length} arquivo(s) não puderam ser excluídos
            </p>
            {result.failedFiles.length <= 3 && (
              <ul className="mt-1 text-xs text-gray-600 dark:text-gray-400 ml-4">
                {result.failedFiles.map((failure, index) => (
                  <li key={index} className="truncate">
                    • {failure.path.split("/").pop()}: {failure.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Summary for many files */}
        {(result.deletedFiles.length > 3 || result.failedFiles.length > 3) && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Total: {result.deletedFiles.length + result.failedFiles.length} arquivos processados
          </div>
        )}
      </div>
    </div>
  );
}
