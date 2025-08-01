/**
 * Tipos para o sistema de contratos
 */

// Re-export types from contract.types.ts for backward compatibility
export type {
  ContractType,
  Contract,
  CreateContractData,
  UpdateContractData,
  ContractFilters,
  ContractResponse,
  ContractsListResponse,
  DeleteContractResponse
} from './contract.types';

// Legacy types for backward compatibility
export type LegacyContractType = 'terms' | 'contract_pf' | 'contract_cnpj';

export interface ContractContent {
  id?: string;
  type: LegacyContractType;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContractEditorProps {
  type: LegacyContractType;
  title: string;
  initialContent?: string;
  onSave: (content: string) => void;
  loading?: boolean;
}

export interface UseContractReturn {
  content: string;
  setContent: (content: string) => void;
  loading: boolean;
  saveContract: (type: LegacyContractType, content: string) => Promise<void>;
  loadContract: (type: LegacyContractType) => Promise<void>;
}
