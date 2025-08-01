/**
 * Hook para gerenciar os termos e condições
 * Responsabilidade única: lógica de estado e operações para termos
 * Este hook é público e não depende de autenticação
 */

import { useState, useEffect, useCallback } from 'react';
import { TermsDbService } from '../../../services/db-services/terms/termsDbService';
import type { TermsState, TermsData } from '../types';

export function useTerms() {
  const [state, setState] = useState<TermsState>({
    terms: null,
    loading: true,
    error: null,
    hasTerms: false
  });

  const loadTerms = useCallback(async () => {
    console.log('🔄 [useTerms] Iniciando carregamento dos termos (público)');
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const response = await TermsDbService.getLatestTerms();

      if (response.success && response.data) {
        const termsData: TermsData = {
          id: response.data.id,
          content: response.data.contract_content,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at || response.data.created_at
        };

        console.log('✅ [useTerms] Termos públicos carregados com sucesso:', {
          id: termsData.id,
          contentLength: termsData.content.length,
          createdAt: termsData.createdAt
        });

        setState(prev => ({
          ...prev,
          terms: termsData,
          loading: false,
          hasTerms: true,
          error: null
        }));
      } else {
        console.log('📭 [useTerms] Nenhum termo público encontrado');
        setState(prev => ({
          ...prev,
          terms: null,
          loading: false,
          hasTerms: false,
          error: response.error
        }));
      }
    } catch (error: any) {
      console.error('💥 [useTerms] Erro inesperado ao carregar termos públicos:', error);
      setState(prev => ({
        ...prev,
        terms: null,
        loading: false,
        hasTerms: false,
        error: error.message || 'Erro inesperado ao carregar termos'
      }));
    }
  }, []);

  const retryLoad = useCallback(() => {
    console.log('🔄 [useTerms] Tentando recarregar termos públicos');
    loadTerms();
  }, [loadTerms]);

  useEffect(() => {
    // Carrega imediatamente, sem depender de autenticação
    loadTerms();
  }, [loadTerms]);

  return {
    ...state,
    loadTerms,
    retryLoad
  };
}
