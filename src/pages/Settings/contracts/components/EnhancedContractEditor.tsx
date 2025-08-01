/**
 * Enhanced Contract Editor with database integration
 * Handles saving contracts to the database using the contract service
 */

import { useState, useEffect } from 'react';
import { ContractEditorProps } from '../types';
import { ContractType } from '../types/contract.types';
import { useContracts } from '../hooks/useContracts';
import { useAuth } from '../../../../hooks/useAuth';
import { usePreview, PreviewModal } from '../features/preview';
import Button from '../../../../components/ui/button/Button';
import TiptapEditor from './TiptapEditor';

// Map legacy types to database types
const mapLegacyTypeToDbType = (legacyType: string): ContractType => {
  switch (legacyType) {
    case 'terms':
      return 'termos_condicoes';
    case 'contract_pf':
      return 'contrato_pf';
    case 'contract_cnpj':
      return 'contrato_cnpj';
    default:
      return 'termos_condicoes';
  }
};

interface EnhancedContractEditorProps extends Omit<ContractEditorProps, 'onSave'> {
  onSave?: (content: string) => void; // Make optional since we handle saving internally
}

export default function EnhancedContractEditor({
  type: legacyType,
  title,
  initialContent = '',
  onSave,
  loading = false
}: EnhancedContractEditorProps) {
  console.log('🎬 [EnhancedContractEditor] COMPONENTE RENDERIZADO');
  console.log('📝 [EnhancedContractEditor] Props:', {
    legacyType,
    title,
    initialContentLength: initialContent?.length || 0,
    hasOnSave: !!onSave,
    loading
  });

  const [content, setContent] = useState<string>(initialContent);
  const { user, loading: loadingAuth, isAdmin } = useAuth();

  console.log('👤 [EnhancedContractEditor] Estado de auth:', {
    userId: user?.id,
    userEmail: user?.email,
    isAdmin,
    loadingAuth
  });

  const {
    saving,
    error,
    upsertContract,
    getContractByAdminAndType,
    clearError
  } = useContracts();

  const { isPreviewOpen, openPreview, closePreview } = usePreview();

  console.log('🔗 [EnhancedContractEditor] Hook useContracts:', {
    saving,
    error,
    hasUpsertContract: !!upsertContract,
    upsertContractType: typeof upsertContract,
    hasGetContract: !!getContractByAdminAndType,
    hasClearError: !!clearError
  });

  const contractType = mapLegacyTypeToDbType(legacyType);

  // Load existing contract on mount
  useEffect(() => {
    const loadExistingContract = async () => {
      if (user?.id && isAdmin) {
        console.log('🔍 [EnhancedContractEditor] Carregando contrato existente para admin:', user.id);
        try {
          const existingContract = await getContractByAdminAndType(user.id, contractType);
          if (existingContract?.contract_content) {
            console.log('📄 [EnhancedContractEditor] Contrato existente encontrado');
            setContent(existingContract.contract_content);
          } else {
            console.log('📭 [EnhancedContractEditor] Nenhum contrato existente encontrado');
          }
        } catch (error) {
          console.error('💥 [EnhancedContractEditor] Erro ao carregar contrato:', error);
        }
      }
    };

    if (!initialContent && !loadingAuth) {
      loadExistingContract();
    }
  }, [user?.id, isAdmin, contractType, getContractByAdminAndType, initialContent, loadingAuth]);

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Event listener for preview button clicks
  useEffect(() => {
    const handlePreviewEvent = (event: CustomEvent) => {
      console.log('👁️ [EnhancedContractEditor] Preview event recebido:', event.detail);
      openPreview();
    };

    window.addEventListener('contractPreview', handlePreviewEvent as EventListener);
    
    return () => {
      window.removeEventListener('contractPreview', handlePreviewEvent as EventListener);
    };
  }, [openPreview]);

  const handleContentChange = (html: string) => {
    setContent(html);
    clearError(); // Clear any previous errors when user types
  };

  const handleSave = async () => {
    console.log('🎯 [EnhancedContractEditor] Iniciando handleSave');
    console.log('📝 [EnhancedContractEditor] Estado atual:', {
      contentLength: content?.length,
      hasContent: !!(content && content.trim() && content !== '<p></p>'),
      userId: user?.id,
      isAdmin,
      contractType
    });

    if (!content.trim() || content === '<p></p>') {
      console.warn('⚠️ [EnhancedContractEditor] Conteúdo vazio, cancelando save');
      alert('Por favor, insira algum conteúdo antes de salvar.');
      return;
    }

    if (!user?.id) {
      console.error('❌ [EnhancedContractEditor] Usuário não autenticado');
      alert('Usuário não autenticado. Faça login para salvar o contrato.');
      return;
    }

    if (!isAdmin) {
      console.error('❌ [EnhancedContractEditor] Usuário não é admin');
      alert('Apenas administradores podem salvar contratos.');
      return;
    }

    try {
      console.log('🚀 [EnhancedContractEditor] Chamando upsertContract');
      console.log('📊 [EnhancedContractEditor] Parâmetros do upsert:', {
        adminId: user.id,
        contractType,
        contentPreview: content.slice(0, 100) + '...'
      });

      console.log('🔥 [EnhancedContractEditor] PRESTES A CHAMAR upsertContract!');
      console.log('🔥 [EnhancedContractEditor] Função upsertContract:', upsertContract);
      console.log('🔥 [EnhancedContractEditor] Tipo da função:', typeof upsertContract);

      // Save to database
      console.log('🔥 [EnhancedContractEditor] EXECUTANDO CHAMADA AGORA...');
      const savedContract = await upsertContract(user.id, contractType, content);
      console.log('🔥 [EnhancedContractEditor] CHAMADA EXECUTADA! Resultado:', savedContract);
      
      console.log('📥 [EnhancedContractEditor] Resultado do upsert:', {
        success: !!savedContract,
        contractId: savedContract?.id,
        savedContract
      });

      if (savedContract) {
        console.log('✅ [EnhancedContractEditor] Contrato salvo com sucesso!');
        alert('Contrato salvo com sucesso!');
        
        // Call legacy onSave callback if provided (for backward compatibility)
        if (onSave) {
          console.log('📞 [EnhancedContractEditor] Chamando callback onSave legado');
          onSave(content);
        }
      } else {
        console.error('❌ [EnhancedContractEditor] upsertContract retornou null');
        alert('Erro ao salvar contrato. Tente novamente.');
      }
    } catch (error) {
      console.error('💥 [EnhancedContractEditor] Erro inesperado no save:', error);
      alert('Erro inesperado ao salvar contrato. Tente novamente.');
    }
  };

  const handleClearContent = () => {
    setContent('');
    clearError();
  };

  const isLoading = loading || saving || loadingAuth;

  if (loadingAuth) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Acesso Restrito
              </h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                {!user ? 'Você precisa estar logado para acessar esta funcionalidade.' : 'Apenas administradores podem editar contratos.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Cabeçalho */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erro ao salvar contrato
              </h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={clearError}
                className="inline-flex text-red-400 hover:text-red-600 dark:hover:text-red-200"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Tiptap */}
      <div className="space-y-4">
        <div>
          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Cole aqui o texto do seu contrato..."
            disabled={isLoading}
            contractType={legacyType}
            contractTitle={title}
            showPreview={true}
          />
        </div>

        {/* Botão de salvar */}
        <div className="flex justify-end gap-3 pt-4">
          {content && content !== '<p></p>' && (
            <button
              type="button"
              onClick={handleClearContent}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 transition duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Limpar
            </button>
          )}
          <Button
            onClick={() => {
              console.log('�🔥🔥 [BOTÃO] CLIQUE REGISTRADO - INÍCIO');
              console.log('🔥🔥🔥 [BOTÃO] Timestamp:', new Date().toISOString());
              
              console.log('�🖱️ [EnhancedContractEditor] BOTÃO SALVAR CLICADO!');
              console.log('📊 [EnhancedContractEditor] Estado do botão:', {
                isLoading,
                hasContent: !!(content && content.trim() && content !== '<p></p>'),
                saving,
                content: content?.slice(0, 50) + '...'
              });
              
              // Teste direto da função
              console.log('🧪 [EnhancedContractEditor] TESTE: Verificando função upsertContract');
              console.log('🧪 [EnhancedContractEditor] upsertContract existe?', !!upsertContract);
              console.log('🧪 [EnhancedContractEditor] upsertContract tipo:', typeof upsertContract);
              
              // Testar se é possível chamar a função diretamente
              console.log('🧪 [EnhancedContractEditor] TESTE DIRETO: Tentando chamar upsertContract');
              if (typeof upsertContract === 'function') {
                console.log('🧪 [EnhancedContractEditor] Função é válida');
                
                // Teste direto sem handleSave
                console.log('🧪 [EnhancedContractEditor] CHAMADA DIRETA upsertContract');
                try {
                  if (user?.id && content) {
                    upsertContract(user.id, contractType, content)
                      .then(result => {
                        console.log('🧪 [EnhancedContractEditor] RESULTADO DIRETO:', result);
                      })
                      .catch(error => {
                        console.error('🧪 [EnhancedContractEditor] ERRO DIRETO:', error);
                      });
                  }
                } catch (error) {
                  console.error('🧪 [EnhancedContractEditor] ERRO NA CHAMADA DIRETA:', error);
                }
                
                console.log('🧪 [EnhancedContractEditor] Também chamando handleSave');
                handleSave();
              } else {
                console.error('❌ [EnhancedContractEditor] upsertContract NÃO é uma função!');
                console.error('❌ [EnhancedContractEditor] Valor atual:', upsertContract);
                alert('ERRO: Função upsertContract não está definida!');
              }
              
              console.log('🔥🔥🔥 [BOTÃO] CLIQUE PROCESSADO - FIM');
            }}
            disabled={isLoading || !content.trim() || content === '<p></p>'}
            className="min-w-32"
          >
            {saving ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        content={content}
        title={title}
      />
    </div>
  );
}
