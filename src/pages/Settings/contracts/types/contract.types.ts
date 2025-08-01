/**
 * Types and interfaces for contract management
 */

export type ContractType = 'termos_condicoes' | 'contrato_pf' | 'contrato_cnpj' | 'politica_privacidade';

export interface Contract {
  id: string;
  admin_id: string;
  type_of_contract: ContractType;
  contract_content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContractData {
  admin_id: string;
  type_of_contract: ContractType;
  contract_content: string;
}

export interface UpdateContractData {
  type_of_contract?: ContractType;
  contract_content?: string;
}

export interface ContractFilters {
  admin_id?: string;
  type_of_contract?: ContractType;
}

export interface ContractResponse {
  data: Contract | null;
  error: string | null;
  success: boolean;
}

export interface ContractsListResponse {
  data: Contract[];
  error: string | null;
  success: boolean;
  count?: number;
}

export interface DeleteContractResponse {
  success: boolean;
  error: string | null;
}
