/**
 * Hook para gerenciar o estado do preview de contratos
 * Responsabilidade: controlar abertura/fechamento do modal de preview
 */

import { useState, useCallback } from 'react';
import { UsePreviewReturn } from '../types/preview.types';

export function usePreview(): UsePreviewReturn {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = useCallback(() => {
    console.log('🔍 [usePreview] Abrindo preview');
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    console.log('❌ [usePreview] Fechando preview');
    setIsPreviewOpen(false);
  }, []);

  return {
    isPreviewOpen,
    openPreview,
    closePreview
  };
}
