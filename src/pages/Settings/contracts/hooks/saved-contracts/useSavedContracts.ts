/**
 * Hook para gerenciar contratos salvos
 */

import { useState, useCallback } from 'react';
import { ContractDbService } from '../../../../../services/db-services/contracts/contractDbService';
import { SavedContractItem, UseSavedContractsReturn } from '../../types/saved-contracts/saved-contracts.types';
import { useAuth } from '../../../../../hooks/useAuth';

export function useSavedContracts(onSelectContract?: (contract: SavedContractItem) => void): UseSavedContractsReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedContracts, setSavedContracts] = useState<SavedContractItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const formatContractForDisplay = useCallback((contract: any): SavedContractItem => {
    const preview = contract.contract_content
      ? contract.contract_content.replace(/<[^>]*>/g, '').slice(0, 100) + '...'
      : 'Sem conteúdo';
    
    const formattedDate = new Date(contract.created_at).toLocaleString('pt-BR');
    
    return {
      ...contract,
      preview,
      formattedDate
    };
  }, []);

  const loadSavedContracts = useCallback(async () => {
    if (!user?.id || !isAdmin) {
      setError('Usuário não autorizado');
      return;
    }

    console.log('📚 [useSavedContracts] Carregando contratos salvos');
    setLoading(true);
    setError(null);

    try {
      const response = await ContractDbService.getContracts({
        admin_id: user.id
      });

      if (response.success && response.data) {
        const formattedContracts = response.data.map(formatContractForDisplay);
        setSavedContracts(formattedContracts);
        console.log('📚 [useSavedContracts] Contratos carregados:', formattedContracts.length);
      } else {
        setError(response.error || 'Erro ao carregar contratos');
      }
    } catch (error) {
      console.error('💥 [useSavedContracts] Erro:', error);
      setError('Erro inesperado ao carregar contratos');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin, formatContractForDisplay]);

  const openModal = useCallback(async () => {
    console.log('📂 [useSavedContracts] Abrindo modal');
    setIsModalOpen(true);
    await loadSavedContracts();
  }, [loadSavedContracts]);

  const closeModal = useCallback(() => {
    console.log('📂 [useSavedContracts] Fechando modal');
    setIsModalOpen(false);
  }, []);

  const selectContract = useCallback((contract: SavedContractItem) => {
    console.log('✅ [useSavedContracts] Contrato selecionado:', contract.id);
    if (onSelectContract) {
      onSelectContract(contract);
    }
    closeModal();
  }, [onSelectContract, closeModal]);

  return {
    isModalOpen,
    savedContracts,
    loading,
    error,
    openModal,
    closeModal,
    loadSavedContracts,
    selectContract
  };
}
