/**
 * Tipos para o sistema de preview de contratos
 */

import { LegacyContractType } from '../../../types';

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  contractType: LegacyContractType;
  title: string;
}

export interface PreviewButtonProps {
  content: string;
  contractType: LegacyContractType;
  title: string;
  disabled?: boolean;
}

export interface UsePreviewReturn {
  isPreviewOpen: boolean;
  openPreview: () => void;
  closePreview: () => void;
}

export interface PreviewConfig {
  title: string;
  subtitle?: string;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
}

export type PreviewMode = 'modal' | 'fullscreen' | 'popup';
