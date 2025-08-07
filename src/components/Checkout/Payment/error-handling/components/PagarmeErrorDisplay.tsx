/**
 * Componente para exibir erros do PagarMe de forma amigável
 * Responsabilidade: Renderizar mensagens de erro com sugestões e ações
 */

import React from 'react';
import { ProcessedError } from '../types/PagarmeErrorTypes';
import { usePagarmeErrorProcessor } from '../PagarmeErrorProcessor';

interface PagarmeErrorDisplayProps {
  error: ProcessedError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const PagarmeErrorDisplay: React.FC<PagarmeErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const { formatErrorForUI } = usePagarmeErrorProcessor();

  if (!error) return null;

  const formattedError = formatErrorForUI(error);
  
  const getIconForType = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getColorClasses = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          icon: 'text-red-400 dark:text-red-500',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          icon: 'text-yellow-400 dark:text-yellow-500',
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-700 dark:text-yellow-300',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
          icon: 'text-blue-400 dark:text-blue-500',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const colors = getColorClasses(formattedError.type);

  return (
    <div className={`rounded-lg border p-4 ${colors.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={colors.icon}>
            {getIconForType(formattedError.type)}
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${colors.title}`}>
            {formattedError.title}
          </h3>
          
          <div className={`mt-2 text-sm ${colors.message}`}>
            <p>{formattedError.message}</p>
            
            {formattedError.suggestion && (
              <p className="mt-2 font-medium">
                💡 {formattedError.suggestion}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="mt-4 flex space-x-3">
            {formattedError.showRetryButton && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tentar novamente
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Fechar
              </button>
            )}
          </div>

          {/* Debug info em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && error.originalMessage && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                Informações técnicas (dev only)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {JSON.stringify({
                  type: error.type,
                  originalMessage: error.originalMessage,
                  actionRequired: error.actionRequired,
                  shouldRetry: error.shouldRetry
                }, null, 2)}
              </pre>
            </details>
          )}
        </div>

        {/* Botão de fechar no canto */}
        {onDismiss && (
          <div className="flex-shrink-0 ml-4">
            <button
              type="button"
              onClick={onDismiss}
              className={`inline-flex rounded-md ${colors.container} p-1.5 ${colors.icon} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-blue-500`}
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
