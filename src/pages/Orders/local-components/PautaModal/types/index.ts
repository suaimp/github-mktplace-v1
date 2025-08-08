/**
 * Types para o modal de envio de pauta
 */

export interface PautaFormData {
  palavraChave: string;
  urlSite: string;
  textoAncora: string;
  requisitosEspeciais: string;
}

export interface PautaOutlineData {
  palavra_chave: string;
  url_site: string;
  texto_ancora: string;
  requisitos_especiais: string;
  created_at: string;
  updated_at: string;
}

export interface PautaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PautaFormData) => Promise<void>;
  itemId: string;
  loading?: boolean;
  submitError?: string | null;
  mode?: 'create' | 'view'; // Novo: modo do modal
  initialData?: PautaFormData; // Novo: dados iniciais para modo view
}

export interface PautaFormErrors {
  palavraChave?: string;
  urlSite?: string;
  textoAncora?: string;
  requisitosEspeciais?: string;
}
