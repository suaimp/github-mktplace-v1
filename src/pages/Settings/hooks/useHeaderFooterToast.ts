import { useState, useCallback } from 'react';

/**
 * Interface para o toast de scripts
 */
interface ScriptToastState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
}

/**
 * Hook para gerenciar toasts específicos da funcionalidade Header/Footer
 * Segue o princípio de responsabilidade única
 */
export const useHeaderFooterToast = () => {
  const [toast, setToast] = useState<ScriptToastState>({
    show: false,
    type: 'success',
    message: '',
  });

  /**
   * Mostra toast de sucesso
   */
  const showSuccessToast = useCallback((message: string = 'Scripts salvos com sucesso!'): void => {
    setToast({
      show: true,
      type: 'success',
      message,
    });

    // Auto-hide após 3 segundos
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  /**
   * Mostra toast de erro
   */
  const showErrorToast = useCallback((message: string): void => {
    setToast({
      show: true,
      type: 'error',
      message,
    });

    // Auto-hide após 5 segundos para erros
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  /**
   * Mostra toast de aviso
   */
  const showWarningToast = useCallback((message: string): void => {
    setToast({
      show: true,
      type: 'warning',
      message,
    });

    // Auto-hide após 4 segundos para avisos
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  /**
   * Oculta o toast manualmente
   */
  const hideToast = useCallback((): void => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  return {
    toast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    hideToast,
  };
};
