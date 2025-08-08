/**
 * Hook personalizado para funcionalidade de copiar texto
 */

import { useState, useCallback } from 'react';

export function useCopyToClipboard() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(identifier);
      
      // Remove a indicação de copiado após 2 segundos
      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      return false;
    }
  }, []);

  return {
    copiedItem,
    copyToClipboard
  };
}
