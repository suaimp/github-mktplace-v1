/**
 * Privacy Policy Database Service
 * Responsável por operações de banco de dados relacionadas à política de privacidade
 * Segue o princípio de responsabilidade única - apenas operações de BD para privacy policy
 */

import { supabase } from '../../../lib/supabase';

export interface PublicPrivacyPolicyData {
  id: string;
  contract_content: string;
  created_at: string;
  updated_at: string | null;
  type_of_contract: string;
}

export interface PrivacyPolicyResponse {
  success: boolean;
  data: PublicPrivacyPolicyData | null;
  error: string | null;
}

export class PrivacyPolicyDbService {
  /**
   * Busca a política de privacidade mais recente
   * Retorna o contrato mais atual do tipo 'politica_privacidade'
   * Esta operação é pública e não requer autenticação
   */
  static async getLatestPrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    try {
      console.log('🔍 [PrivacyPolicyDbService] Buscando política de privacidade pública');

      // Busca pública - não precisa de autenticação
      const { data: privacyPolicy, error } = await supabase
        .from('contracts')
        .select('id, contract_content, created_at, updated_at, type_of_contract')
        .eq('type_of_contract', 'politica_privacidade')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [PrivacyPolicyDbService] Erro ao buscar política de privacidade:', error);
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      console.log('📄 [PrivacyPolicyDbService] Política de privacidade encontrada:', {
        found: !!privacyPolicy,
        id: privacyPolicy?.id,
        contentLength: privacyPolicy?.contract_content?.length || 0,
        createdAt: privacyPolicy?.created_at
      });

      return {
        success: true,
        data: privacyPolicy,
        error: null
      };
    } catch (error: any) {
      console.error('💥 [PrivacyPolicyDbService] Erro inesperado:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Erro inesperado ao buscar política de privacidade'
      };
    }
  }

  /**
   * Verifica se existe política de privacidade cadastrada
   */
  static async hasPrivacyPolicy(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('contracts')
        .select('*', { count: 'exact', head: true })
        .eq('type_of_contract', 'politica_privacidade');

      if (error) {
        console.error('❌ [PrivacyPolicyDbService] Erro ao verificar existência de política de privacidade:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('💥 [PrivacyPolicyDbService] Erro inesperado ao verificar política de privacidade:', error);
      return false;
    }
  }
}
