import { useEffect, useCallback } from 'react';

interface UseDOMReadyOptions {
  onReady: () => void;
  dependencies?: React.DependencyList;
  delay?: number;
}

export function useDOMReady({ onReady, dependencies = [], delay = 0 }: UseDOMReadyOptions) {
  const executeOnReady = useCallback(() => {
    const timeoutId = setTimeout(() => {
      onReady();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [onReady, delay]);

  // Executar quando o DOM estiver pronto
  useEffect(() => {
    if (document.readyState === 'complete') {
      return executeOnReady();
    }

    const handleLoad = () => {
      executeOnReady();
    };

    window.addEventListener('load', handleLoad);
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [executeOnReady]);

  // Executar quando as dependências mudarem
  useEffect(() => {
    return executeOnReady();
  }, dependencies);

  // Executar também com um delay adicional para garantir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onReady();
    }, 300); // Delay adicional para elementos complexos

    return () => clearTimeout(timeoutId);
  }, [onReady]);
}
