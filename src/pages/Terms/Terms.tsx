/**
 * Página principal dos Termos e Condições
 * Responsabilidade única: orquestrar a exibição dos termos baseado no estado
 */

import { useTerms } from './hooks/useTerms';
import TermsContent from './components/TermsContent';
import TermsLoading from './components/TermsLoading';
import TermsError from './components/TermsError';
import TermsEmpty from './components/TermsEmpty';
import type { TermsPageProps } from './types';

export default function Terms({ className = '' }: TermsPageProps) {
  const { terms, loading, error, hasTerms, retryLoad } = useTerms();

  console.log('📄 [Terms] Renderizando página com estado:', {
    loading,
    hasTerms,
    hasError: !!error,
    hasContent: !!terms
  });

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Loading state */}
        {loading && (
          <TermsLoading />
        )}

        {/* Error state */}
        {!loading && error && (
          <TermsError 
            error={error} 
            onRetry={retryLoad}
          />
        )}

        {/* Empty state */}
        {!loading && !error && !hasTerms && (
          <TermsEmpty />
        )}

        {/* Content state */}
        {!loading && !error && hasTerms && terms && (
          <TermsContent
            content={terms.content}
          />
        )}
      </div>
    </div>
  );
}
