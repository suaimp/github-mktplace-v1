/**
 * Terms Database Service
 * Responsável por operações de banco de dados relacionadas aos termos e condições
 * Segue o princípio de responsabilidade única - apenas operações de BD para terms
 */

import { supabase } from '../../../lib/supabase';

export interface PublicTermsData {
  id: string;
  contract_content: string;
  created_at: string;
  updated_at: string | null;
  type_of_contract: string;
}

export interface TermsResponse {
  success: boolean;
  data: PublicTermsData | null;
  error: string | null;
}

export class TermsDbService {
  /**
   * Busca os termos e condições mais recentes
   * Retorna o contrato mais atual do tipo 'termos_condicoes'
   * Esta operação é pública e não requer autenticação
   */
  static async getLatestTerms(): Promise<TermsResponse> {
    try {
      console.log('🔍 [TermsDbService] Buscando termos e condições públicos');

      // Busca pública - não precisa de autenticação
      const { data: terms, error } = await supabase
        .from('contracts')
        .select('id, contract_content, created_at, updated_at, type_of_contract')
        .eq('type_of_contract', 'termos_condicoes')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [TermsDbService] Erro ao buscar termos:', error);
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      console.log('📄 [TermsDbService] Termos encontrados:', {
        found: !!terms,
        id: terms?.id,
        contentLength: terms?.contract_content?.length || 0,
        createdAt: terms?.created_at
      });

      return {
        success: true,
        data: terms,
        error: null
      };
    } catch (error: any) {
      console.error('💥 [TermsDbService] Erro inesperado:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erro inesperado ao buscar termos'
      };
    }
  }

  /**
   * Verifica se existem termos e condições cadastrados
   */
  static async hasTerms(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('type_of_contract', 'termos_condicoes');

      if (error) {
        console.error('❌ [TermsDbService] Erro ao verificar existência de termos:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('💥 [TermsDbService] Erro inesperado ao verificar termos:', error);
      return false;
    }
  }
}
