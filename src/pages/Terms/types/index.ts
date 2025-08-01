/**
 * Types específicos para a feature Terms
 * Responsabilidade única: definições de tipos para termos e condições
 */

export interface TermsData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TermsState {
  terms: TermsData | null;
  loading: boolean;
  error: string | null;
  hasTerms: boolean;
}

export interface TermsPageProps {
  className?: string;
}

export interface TermsContentProps {
  content: string;
  className?: string;
}

export interface TermsLoadingProps {
  className?: string;
}

export interface TermsErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export interface TermsEmptyProps {
  className?: string;
}
