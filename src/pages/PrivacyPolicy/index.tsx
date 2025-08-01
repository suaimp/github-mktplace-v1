/**
 * Página principal da Política de Privacidade
 * Responsabilidade única: renderizar a política de privacidade pública
 * Esta página é acessível sem autenticação
 */

import { usePrivacyPolicy } from './hooks/usePrivacyPolicy';
import PrivacyPolicyContent from './components/PrivacyPolicyContent';
import PrivacyPolicyLoading from './components/PrivacyPolicyLoading';
import PrivacyPolicyError from './components/PrivacyPolicyError';
import PrivacyPolicyEmpty from './components/PrivacyPolicyEmpty';

export default function PrivacyPolicy() {
  const { privacyPolicy, loading, error, retryLoad } = usePrivacyPolicy();

  console.log('🎭 [PrivacyPolicy] Renderizando página:', {
    hasPrivacyPolicy: !!privacyPolicy,
    loading,
    error,
    contentLength: privacyPolicy?.content?.length || 0
  });

  // Estado de carregamento
  if (loading) {
    console.log('⏳ [PrivacyPolicy] Exibindo loading');
    return (
      <div className="container mx-auto px-4 py-8">
        <PrivacyPolicyLoading />
      </div>
    );
  }

  // Estado de erro
  if (error) {
    console.log('❌ [PrivacyPolicy] Exibindo erro:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <PrivacyPolicyError error={error} onRetry={retryLoad} />
      </div>
    );
  }

  // Estado vazio (sem política de privacidade)
  if (!privacyPolicy || !privacyPolicy.content) {
    console.log('📭 [PrivacyPolicy] Exibindo estado vazio');
    return (
      <div className="container mx-auto px-4 py-8">
        <PrivacyPolicyEmpty />
      </div>
    );
  }

  // Exibir conteúdo da política de privacidade
  console.log('📄 [PrivacyPolicy] Exibindo conteúdo da política de privacidade:', {
    contentLength: privacyPolicy.content.length,
    id: privacyPolicy.id
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <PrivacyPolicyContent 
        content={privacyPolicy.content}
        className="animate-fadeIn"
      />
    </div>
  );
}
