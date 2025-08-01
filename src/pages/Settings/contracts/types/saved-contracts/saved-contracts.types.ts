/**
 * Tipos para o sistema de contratos salvos
 */

import { Contract } from '../contract.types';

export interface SavedContractItem extends Contract {
  preview: string; // Primeiros 100 caracteres do conteúdo
  formattedDate: string; // Data formatada para exibição
}

export interface SavedContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContract: (contract: SavedContractItem) => void;
  currentContractType?: string;
}

export interface SavedContractsListProps {
  contracts: SavedContractItem[];
  onSelectContract: (contract: SavedContractItem) => void;
  loading: boolean;
}

export interface UseSavedContractsReturn {
  isModalOpen: boolean;
  savedContracts: SavedContractItem[];
  loading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  loadSavedContracts: () => Promise<void>;
  selectContract: (contract: SavedContractItem) => void;
}
