/**
 * Hook for contract management operations
 * Provides contract CRUD operations with loading states
 */

import { useState, useCallback } from 'react';
import { ContractDbService } from '../../../../services/db-services/contracts/contractDbService';
import type {
  ContractType,
  CreateContractData,
  UpdateContractData,
  ContractFilters,
  Contract
} from '../types/contract.types';

interface UseContractsState {
  contracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
}

interface UseContractsActions {
  createContract: (data: CreateContractData) => Promise<Contract | null>;
  getContracts: (filters?: ContractFilters) => Promise<Contract[]>;
  getContractById: (id: string) => Promise<Contract | null>;
  getContractByAdminAndType: (adminId: string, type: ContractType) => Promise<Contract | null>;
  updateContract: (id: string, data: UpdateContractData) => Promise<Contract | null>;
  upsertContract: (adminId: string, type: ContractType, content: string) => Promise<Contract | null>;
  deleteContract: (id: string) => Promise<boolean>;
  deleteContractsByAdmin: (adminId: string) => Promise<boolean>;
  clearError: () => void;
  resetState: () => void;
}

export function useContracts(): UseContractsState & UseContractsActions {
  console.log('🎣 [useContracts] Hook inicializado!');
  
  const [state, setState] = useState<UseContractsState>({
    contracts: [],
    currentContract: null,
    loading: false,
    error: null,
    saving: false
  });

  console.log('🎣 [useContracts] Estado atual:', state);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setState(prev => ({ ...prev, saving }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const resetState = useCallback(() => {
    setState({
      contracts: [],
      currentContract: null,
      loading: false,
      error: null,
      saving: false
    });
  }, []);

  const createContract = useCallback(async (data: CreateContractData): Promise<Contract | null> => {
    setSaving(true);
    clearError();

    try {
      const response = await ContractDbService.createContract(data);
      
      if (!response.success || !response.data) {
        setError(response.error || 'Erro ao criar contrato');
        return null;
      }

      setState(prev => ({
        ...prev,
        contracts: [response.data!, ...prev.contracts],
        currentContract: response.data!
      }));

      return response.data;
    } catch (error) {
      console.error('Error in createContract:', error);
      setError('Erro inesperado ao criar contrato');
      return null;
    } finally {
      setSaving(false);
    }
  }, [setSaving, clearError, setError]);

  const getContracts = useCallback(async (filters?: ContractFilters): Promise<Contract[]> => {
    setLoading(true);
    clearError();

    try {
      const response = await ContractDbService.getContracts(filters);
      
      if (!response.success) {
        setError(response.error || 'Erro ao buscar contratos');
        return [];
      }

      setState(prev => ({
        ...prev,
        contracts: response.data
      }));

      return response.data;
    } catch (error) {
      console.error('Error in getContracts:', error);
      setError('Erro inesperado ao buscar contratos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getContractById = useCallback(async (id: string): Promise<Contract | null> => {
    setLoading(true);
    clearError();

    try {
      const response = await ContractDbService.getContractById(id);
      
      if (!response.success || !response.data) {
        setError(response.error || 'Contrato não encontrado');
        return null;
      }

      setState(prev => ({
        ...prev,
        currentContract: response.data!
      }));

      return response.data;
    } catch (error) {
      console.error('Error in getContractById:', error);
      setError('Erro inesperado ao buscar contrato');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getContractByAdminAndType = useCallback(async (
    adminId: string, 
    type: ContractType
  ): Promise<Contract | null> => {
    setLoading(true);
    clearError();

    try {
      const response = await ContractDbService.getContractByAdminAndType(adminId, type);
      
      if (!response.success) {
        if (response.error) {
          setError(response.error);
        }
        return null;
      }

      setState(prev => ({
        ...prev,
        currentContract: response.data
      }));

      return response.data;
    } catch (error) {
      console.error('Error in getContractByAdminAndType:', error);
      setError('Erro inesperado ao buscar contrato');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const updateContract = useCallback(async (
    id: string, 
    data: UpdateContractData
  ): Promise<Contract | null> => {
    setSaving(true);
    clearError();

    try {
      const response = await ContractDbService.updateContract(id, data);
      
      if (!response.success || !response.data) {
        setError(response.error || 'Erro ao atualizar contrato');
        return null;
      }

      setState(prev => ({
        ...prev,
        contracts: prev.contracts.map(contract =>
          contract.id === id ? response.data! : contract
        ),
        currentContract: response.data!
      }));

      return response.data;
    } catch (error) {
      console.error('Error in updateContract:', error);
      setError('Erro inesperado ao atualizar contrato');
      return null;
    } finally {
      setSaving(false);
    }
  }, [setSaving, clearError, setError]);

  const upsertContract = useCallback(async (
    adminId: string,
    type: ContractType,
    content: string
  ): Promise<Contract | null> => {
    console.log('🚀 [useContracts] Iniciando upsertContract');
    console.log('📊 [useContracts] Parâmetros:', {
      adminId,
      type,
      contentLength: content?.length,
      contentPreview: content?.slice(0, 50) + '...'
    });

    setSaving(true);
    clearError();

    try {
      console.log('🔄 [useContracts] Chamando ContractDbService.upsertContract');
      const response = await ContractDbService.upsertContract(adminId, type, content);
      
      console.log('📥 [useContracts] Resposta do service:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
        dataId: response.data?.id
      });

      if (!response.success || !response.data) {
        console.error('❌ [useContracts] Falha no upsert:', response.error);
        setError(response.error || 'Erro ao salvar contrato');
        return null;
      }

      console.log('✅ [useContracts] Contrato salvo, atualizando estado local');
      setState(prev => {
        const existingIndex = prev.contracts.findIndex(
          contract => contract.admin_id === adminId && contract.type_of_contract === type
        );

        let updatedContracts;
        if (existingIndex >= 0) {
          // Update existing contract
          console.log('🔄 [useContracts] Atualizando contrato existente no índice:', existingIndex);
          updatedContracts = prev.contracts.map((contract, index) =>
            index === existingIndex ? response.data! : contract
          );
        } else {
          // Add new contract
          console.log('➕ [useContracts] Adicionando novo contrato ao estado');
          updatedContracts = [response.data!, ...prev.contracts];
        }

        return {
          ...prev,
          contracts: updatedContracts,
          currentContract: response.data!
        };
      });

      console.log('🎉 [useContracts] Processo de upsert concluído com sucesso');
      return response.data;
    } catch (error) {
      console.error('💥 [useContracts] Erro inesperado no upsertContract:', error);
      setError('Erro inesperado ao salvar contrato');
      return null;
    } finally {
      setSaving(false);
    }
  }, [setSaving, clearError, setError]);

  const deleteContract = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    clearError();

    try {
      const response = await ContractDbService.deleteContract(id);
      
      if (!response.success) {
        setError(response.error || 'Erro ao deletar contrato');
        return false;
      }

      setState(prev => ({
        ...prev,
        contracts: prev.contracts.filter(contract => contract.id !== id),
        currentContract: prev.currentContract?.id === id ? null : prev.currentContract
      }));

      return true;
    } catch (error) {
      console.error('Error in deleteContract:', error);
      setError('Erro inesperado ao deletar contrato');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const deleteContractsByAdmin = useCallback(async (adminId: string): Promise<boolean> => {
    setLoading(true);
    clearError();

    try {
      const response = await ContractDbService.deleteContractsByAdmin(adminId);
      
      if (!response.success) {
        setError(response.error || 'Erro ao deletar contratos');
        return false;
      }

      setState(prev => ({
        ...prev,
        contracts: prev.contracts.filter(contract => contract.admin_id !== adminId),
        currentContract: prev.currentContract?.admin_id === adminId ? null : prev.currentContract
      }));

      return true;
    } catch (error) {
      console.error('Error in deleteContractsByAdmin:', error);
      setError('Erro inesperado ao deletar contratos');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const returnValue = {
    // State
    ...state,
    
    // Actions
    createContract,
    getContracts,
    getContractById,
    getContractByAdminAndType,
    updateContract,
    upsertContract,
    deleteContract,
    deleteContractsByAdmin,
    clearError,
    resetState
  };

  console.log('🎣 [useContracts] Retornando:', {
    hasUpsertContract: !!returnValue.upsertContract,
    upsertContractType: typeof returnValue.upsertContract,
    stateSaving: state.saving,
    stateError: state.error
  });

  return returnValue;
}
