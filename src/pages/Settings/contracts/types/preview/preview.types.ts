/**
 * Tipos para o sistema de preview de contratos
 */

export interface PreviewData {
  title: string;
  content: string;
  contractType: string;
  timestamp: string;
}

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: PreviewData;
}

export interface UsePreviewReturn {
  isPreviewOpen: boolean;
  previewData: PreviewData | null;
  openPreview: (title: string, content: string, contractType: string) => void;
  closePreview: () => void;
}
