export interface SiteMetaFormData {
  site_title: string;
  site_description: string;
}

export interface SiteMetaFormProps {
  initialData?: SiteMetaFormData;
  onSubmit?: (data: SiteMetaFormData) => Promise<void>;
  onChange?: (data: SiteMetaFormData) => void;
  loading?: boolean;
  hideSubmitButton?: boolean;
}

export interface UseSiteMetaReturn {
  metaData: SiteMetaFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
  updateMetaData: (data: SiteMetaFormData) => Promise<void>;
  resetStatus: () => void;
}

// Tipos para Contratos
export interface ContractData {
  id?: string;
  title: string;
  content: string;
  type: 'terms' | 'contract_pf' | 'contract_cnpj';
  is_active: boolean;
  version: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ContractFormData {
  title: string;
  content: string;
  is_active: boolean;
  version: string;
}

export interface ContractTabContentProps {
  contractType: ContractData['type'];
}
