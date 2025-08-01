/**
 * Exportações centralizadas da feature Terms
 * Responsabilidade única: centralizar exports para facilitar imports
 */

// Página principal
export { default as Terms } from './Terms';

// Components
export { default as TermsContent } from './components/TermsContent';
export { default as TermsLoading } from './components/TermsLoading';
export { default as TermsError } from './components/TermsError';
export { default as TermsEmpty } from './components/TermsEmpty';

// Hooks
export { useTerms } from './hooks/useTerms';

// Types
export type * from './types';
