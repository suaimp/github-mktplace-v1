/**
 * Hook para gerenciar o sistema de preview de contratos
 */

import { useState, useCallback } from 'react';
import { PreviewData, UsePreviewReturn } from '../../types/preview/preview.types';

export function usePreview(): UsePreviewReturn {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const openPreview = useCallback((title: string, content: string, contractType: string) => {
    console.log('👁️ [usePreview] Abrindo preview:', { title, contractType });
    
    setPreviewData({
      title,
      content,
      contractType,
      timestamp: new Date().toLocaleString('pt-BR')
    });
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    console.log('👁️ [usePreview] Fechando preview');
    setIsPreviewOpen(false);
    setPreviewData(null);
  }, []);

  return {
    isPreviewOpen,
    previewData,
    openPreview,
    closePreview
  };
}
