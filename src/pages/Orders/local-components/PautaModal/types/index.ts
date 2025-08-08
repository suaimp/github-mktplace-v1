/**
 * Types para o modal de envio de pauta
 */

export interface PautaFormData {
  palavraChave: string;
  urlSite: string;
  textoAncora: string;
  requisitosEspeciais: string;
}

export interface PautaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PautaFormData) => Promise<void>;
  itemId: string;
  loading?: boolean;
}

export interface PautaFormErrors {
  palavraChave?: string;
  urlSite?: string;
  textoAncora?: string;
  requisitosEspeciais?: string;
}
