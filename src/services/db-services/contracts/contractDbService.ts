/**
 * Database service for contract operations
 * Handles all CRUD operations for the contracts table
 */

import { supabase } from '../../../lib/supabase';
import type {
  CreateContractData,
  UpdateContractData,
  ContractFilters,
  ContractResponse,
  ContractsListResponse,
  DeleteContractResponse,
  ContractType
} from '../../../pages/Settings/contracts/types/contract.types';

export class ContractDbService {
  /**
   * Creates a new contract
   */
  static async createContract(data: CreateContractData): Promise<ContractResponse> {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating contract:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: contract,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error creating contract:', error);
      return {
        data: null,
        error: 'Erro inesperado ao criar contrato',
        success: false
      };
    }
  }

  /**
   * Gets all contracts with optional filters
   */
  static async getContracts(filters?: ContractFilters): Promise<ContractsListResponse> {
    try {
      let query = supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.admin_id) {
        query = query.eq('admin_id', filters.admin_id);
      }

      if (filters?.type_of_contract) { // Corrigido: usar 'type_of_contract' conforme schema
        query = query.eq('type_of_contract', filters.type_of_contract);
      }

      const { data: contracts, error, count } = await query;

      if (error) {
        console.error('Error fetching contracts:', error);
        return {
          data: [],
          error: error.message,
          success: false
        };
      }

      return {
        data: contracts || [],
        error: null,
        success: true,
        count: count || contracts?.length || 0
      };
    } catch (error) {
      console.error('Unexpected error fetching contracts:', error);
      return {
        data: [],
        error: 'Erro inesperado ao buscar contratos',
        success: false
      };
    }
  }

  /**
   * Gets a contract by ID
   */
  static async getContractById(id: string): Promise<ContractResponse> {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contract by ID:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: contract,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error fetching contract by ID:', error);
      return {
        data: null,
        error: 'Erro inesperado ao buscar contrato',
        success: false
      };
    }
  }

  /**
   * Gets a contract by admin ID and type (since there's a unique constraint)
   */
  static async getContractByAdminAndType(
    adminId: string, 
    contractType: ContractType
  ): Promise<ContractResponse> {
    try {
      console.log('🔍 [ContractDbService] Buscando contrato por admin e tipo:', {
        adminId,
        contractType
      });

      const { data: contract, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('admin_id', adminId)
        .eq('type_of_contract', contractType) // Corrigido: usar 'type_of_contract'
        .maybeSingle();

      console.log('📥 [ContractDbService] Resultado da busca:', {
        found: !!contract,
        contract: contract,
        error: error?.message
      });

      if (error) {
        console.error('❌ [ContractDbService] Erro ao buscar contrato:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: contract,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('💥 [ContractDbService] Erro inesperado ao buscar contrato:', error);
      return {
        data: null,
        error: 'Erro inesperado ao buscar contrato',
        success: false
      };
    }
  }

  /**
   * Updates a contract by ID
   */
  static async updateContract(id: string, data: UpdateContractData): Promise<ContractResponse> {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contract:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: contract,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error updating contract:', error);
      return {
        data: null,
        error: 'Erro inesperado ao atualizar contrato',
        success: false
      };
    }
  }

  /**
   * Updates or creates a contract for a specific admin and type
   */
  static async upsertContract(
    adminId: string,
    contractType: ContractType,
    content: string
  ): Promise<ContractResponse> {
    console.log('🔥 [ContractDbService] ═══ INÍCIO UPSERT ═══');
    console.log('🔥 [ContractDbService] Timestamp:', new Date().toISOString());
    
    try {
      console.log('🔄 [ContractDbService] Iniciando upsert de contrato');
      console.log('📝 [ContractDbService] Parâmetros recebidos:', {
        adminId,
        contractType,
        contentLength: content?.length || 0,
        contentPreview: content?.slice(0, 100) + '...'
      });

      // Teste básico de conexão com Supabase
      console.log('🔌 [ContractDbService] Testando conexão com Supabase...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('contracts')
        .select('count(*)', { count: 'exact' })
        .limit(0);
      
      console.log('📊 [ContractDbService] Teste de conexão:', {
        success: !connectionError,
        connectionTest,
        connectionError: connectionError?.message
      });

      if (connectionError) {
        console.error('❌ [ContractDbService] Falha na conexão com Supabase');
        return {
          data: null,
          error: `Erro de conexão: ${connectionError.message}`,
          success: false
        };
      }

      // Verificar se o admin existe
      console.log('👤 [ContractDbService] Verificando existência do admin...');
      const { data: adminExists, error: adminCheckError } = await supabase
        .from('admins')
        .select('id, role')
        .eq('id', adminId)
        .single();

      console.log('👤 [ContractDbService] Verificação de admin:', {
        adminExists: !!adminExists,
        adminData: adminExists,
        adminCheckError: adminCheckError?.message
      });

      if (adminCheckError) {
        console.log('⚠️ [ContractDbService] Admin não encontrado na tabela admins, mas continuando...');
        console.log('💡 [ContractDbService] Possível causa: RLS pode estar bloqueando ou admin não existe');
      }

      const upsertData = {
        admin_id: adminId,
        type_of_contract: contractType,
        contract_content: content
      };

      console.log('📤 [ContractDbService] Dados preparados para upsert:', upsertData);
      console.log('🚀 [ContractDbService] Executando comando upsert...');

      const { data: contract, error } = await supabase
        .from('contracts')
        .upsert(upsertData, {
          onConflict: 'admin_id,type_of_contract'
        })
        .select()
        .single();

      console.log('📥 [ContractDbService] RESPOSTA BRUTA do Supabase:');
      console.log('📥 [ContractDbService] - contract:', contract);
      console.log('📥 [ContractDbService] - error:', error);
      console.log('📥 [ContractDbService] - hasData:', !!contract);
      console.log('📥 [ContractDbService] - errorCode:', error?.code);
      console.log('📥 [ContractDbService] - errorMessage:', error?.message);
      console.log('📥 [ContractDbService] - errorDetails:', error?.details);

      if (error) {
        console.error('❌ [ContractDbService] Erro no upsert:', error);
        console.error('❌ [ContractDbService] Tipo do erro:', typeof error);
        console.error('❌ [ContractDbService] Stack trace:', error.stack);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      if (!contract) {
        console.error('❌ [ContractDbService] Upsert retornou sucesso mas sem dados');
        return {
          data: null,
          error: 'Upsert executado mas nenhum dado retornado',
          success: false
        };
      }

      console.log('✅ [ContractDbService] Contrato salvo com sucesso:', contract?.id);
      console.log('🔥 [ContractDbService] ═══ FIM UPSERT SUCESSO ═══');
      return {
        data: contract,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('💥 [ContractDbService] Erro inesperado no upsert:', error);
      console.error('💥 [ContractDbService] Tipo:', typeof error);
      if (error instanceof Error) {
        console.error('💥 [ContractDbService] Stack:', error.stack);
      }
      console.log('🔥 [ContractDbService] ═══ FIM UPSERT ERRO ═══');
      return {
        data: null,
        error: 'Erro inesperado ao salvar contrato',
        success: false
      };
    }
  }

  /**
   * Deletes a contract by ID
   */
  static async deleteContract(id: string): Promise<DeleteContractResponse> {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contract:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Unexpected error deleting contract:', error);
      return {
        success: false,
        error: 'Erro inesperado ao deletar contrato'
      };
    }
  }

  /**
   * Deletes all contracts for an admin
   */
  static async deleteContractsByAdmin(adminId: string): Promise<DeleteContractResponse> {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('admin_id', adminId);

      if (error) {
        console.error('Error deleting contracts by admin:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Unexpected error deleting contracts by admin:', error);
      return {
        success: false,
        error: 'Erro inesperado ao deletar contratos'
      };
    }
  }
}
