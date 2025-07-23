interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="my-6 text-center">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <span className="text-gray-400 text-theme-xs">Site</span>
        <span className="text-right text-gray-400 text-theme-xs">Desconto</span>
      </div>
      <div className="py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 border border-brand-300 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
