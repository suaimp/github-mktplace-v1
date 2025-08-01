/**
 * Componente de erro para a página de termos
 * Responsabilidade única: exibir estados de erro
 */

import type { TermsErrorProps } from '../types';

export default function TermsError({ 
  error, 
  onRetry, 
  className = '' 
}: TermsErrorProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Error icon */}
        <div className="w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400">
          <svg 
            className="w-full h-full" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>

        {/* Error title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Erro ao carregar termos
        </h3>

        {/* Error message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'Ocorreu um erro inesperado ao carregar os termos e condições.'}
        </p>

        {/* Retry button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
