/**
 * Hook personalizado para tratamento de erros do PagarMe
 * Responsabilidade: Simplificar o uso do sistema de tratamento de erros
 */

import { useState, useCallback } from 'react';
import { ProcessedError } from '../types/PagarmeErrorTypes';
import { usePagarmeErrorProcessor } from '../PagarmeErrorProcessor';

export interface UsePagarmeErrorHandlerOptions {
  component?: string;
  enableAutoRetry?: boolean;
  maxRetryAttempts?: number;
  retryDelayMs?: number;
  onError?: (error: ProcessedError) => void;
  onRetry?: () => void;
}

export interface PagarmeErrorState {
  error: ProcessedError | null;
  isRetrying: boolean;
  retryCount: number;
  hasError: boolean;
}

export function usePagarmeErrorHandler(options: UsePagarmeErrorHandlerOptions = {}) {
  const {
    component = 'unknown',
    enableAutoRetry = false,
    maxRetryAttempts = 3,
    retryDelayMs = 2000,
    onError,
    onRetry
  } = options;

  const { processError, formatErrorForUI } = usePagarmeErrorProcessor();

  const [errorState, setErrorState] = useState<PagarmeErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    hasError: false
  });

  /**
   * Processa e define um erro
   */
  const handleError = useCallback((
    error: any,
    action: string = 'payment'
  ) => {
    const processedError = processError(error, component, action);
    
    setErrorState(prev => ({
      ...prev,
      error: processedError,
      hasError: true,
      isRetrying: false
    }));

    // Callback personalizado
    if (onError) {
      onError(processedError);
    }

    // Auto retry para erros de sistema
    if (enableAutoRetry && 
        processedError.shouldRetry && 
        errorState.retryCount < maxRetryAttempts) {
      
      setTimeout(() => {
        retry();
      }, retryDelayMs);
    }
  }, [
    processError, 
    component, 
    onError, 
    enableAutoRetry, 
    errorState.retryCount, 
    maxRetryAttempts, 
    retryDelayMs
  ]);

  /**
   * Executa retry
   */
  const retry = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    if (onRetry) {
      onRetry();
    }

    // Simular sucesso do retry (implementar lógica específica conforme necessário)
    setTimeout(() => {
      setErrorState(prev => ({
        ...prev,
        isRetrying: false
      }));
    }, 1000);
  }, [onRetry]);

  /**
   * Limpa o erro
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      hasError: false
    });
  }, []);

  /**
   * Verifica se pode tentar novamente
   */
  const canRetry = useCallback(() => {
    return errorState.error?.shouldRetry && 
           errorState.retryCount < maxRetryAttempts &&
           !errorState.isRetrying;
  }, [errorState, maxRetryAttempts]);

  /**
   * Obtém mensagem formatada para UI
   */
  const getFormattedError = useCallback(() => {
    if (!errorState.error) return null;
    return formatErrorForUI(errorState.error);
  }, [errorState.error, formatErrorForUI]);

  /**
   * Wrapper para funções assíncronas com tratamento de erro automático
   */
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    action?: string
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        clearError();
        const result = await fn(...args);
        return result;
      } catch (error) {
        handleError(error, action);
        return null;
      }
    };
  }, [handleError, clearError]);

  /**
   * Verifica se é um erro específico
   */
  const isErrorType = useCallback((type: ProcessedError['type']) => {
    return errorState.error?.type === type;
  }, [errorState.error]);

  /**
   * Verifica se requer ação específica
   */
  const requiresAction = useCallback((action: ProcessedError['actionRequired']) => {
    return errorState.error?.actionRequired === action;
  }, [errorState.error]);

  return {
    // Estado
    ...errorState,
    
    // Ações
    handleError,
    retry,
    clearError,
    
    // Utilitários
    canRetry: canRetry(),
    formattedError: getFormattedError(),
    withErrorHandling,
    isErrorType,
    requiresAction,
    
    // Verificações rápidas
    isValidationError: isErrorType('validation'),
    isCardError: isErrorType('card'),
    isSystemError: isErrorType('system'),
    needsCardDataCheck: requiresAction('check_card_data'),
    needsDifferentCard: requiresAction('try_different_card'),
    needsToTryLater: requiresAction('try_again_later'),
    needsSupport: requiresAction('contact_support')
  };
}
