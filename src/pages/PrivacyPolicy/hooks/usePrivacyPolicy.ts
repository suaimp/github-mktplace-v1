/**
 * Hook para gerenciar a política de privacidade
 * Responsabilidade única: lógica de estado e operações para política de privacidade
 * Este hook é público e não depende de autenticação
 */

import { useState, useEffect, useCallback } from 'react';
import { PrivacyPolicyDbService } from '../../../services/db-services/privacy-policy/privacyPolicyDbService';
import type { PrivacyPolicyState, PrivacyPolicyData } from '../types';

export function usePrivacyPolicy() {
  const [state, setState] = useState<PrivacyPolicyState>({
    privacyPolicy: null,
    loading: true,
    error: null
  });

  const loadPrivacyPolicy = useCallback(async () => {
    console.log('🔄 [usePrivacyPolicy] Iniciando carregamento da política de privacidade (público)');
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const response = await PrivacyPolicyDbService.getLatestPrivacyPolicy();

      if (response.success && response.data) {
        const privacyPolicyData: PrivacyPolicyData = {
          id: response.data.id,
          content: response.data.contract_content,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at || response.data.created_at
        };

        console.log('✅ [usePrivacyPolicy] Política de privacidade pública carregada com sucesso:', {
          id: privacyPolicyData.id,
          contentLength: privacyPolicyData.content.length,
          createdAt: privacyPolicyData.createdAt
        });

        setState(prev => ({
          ...prev,
          privacyPolicy: privacyPolicyData,
          loading: false,
          error: null
        }));
      } else {
        console.log('📭 [usePrivacyPolicy] Nenhuma política de privacidade pública encontrada');
        setState(prev => ({
          ...prev,
          privacyPolicy: null,
          loading: false,
          error: response.error
        }));
      }
    } catch (error: any) {
      console.error('💥 [usePrivacyPolicy] Erro inesperado ao carregar política de privacidade pública:', error);
      setState(prev => ({
        ...prev,
        privacyPolicy: null,
        loading: false,
        error: error.message || 'Erro inesperado ao carregar política de privacidade'
      }));
    }
  }, []);

  const retryLoad = useCallback(() => {
    console.log('🔄 [usePrivacyPolicy] Tentando recarregar política de privacidade pública');
    loadPrivacyPolicy();
  }, [loadPrivacyPolicy]);

  useEffect(() => {
    // Carrega imediatamente, sem depender de autenticação
    loadPrivacyPolicy();
  }, [loadPrivacyPolicy]);

  return {
    privacyPolicy: state.privacyPolicy,
    loading: state.loading,
    error: state.error,
    refetch: loadPrivacyPolicy,
    retryLoad
  };
}
