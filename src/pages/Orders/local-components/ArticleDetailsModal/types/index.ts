/**
 * Tipos para o modal de detalhes do artigo
 */

export interface PautaData {
  id: string;
  order_item_id: string;
  palavra_chave?: string;
  url_site?: string;
  texto_ancora?: string;
  requisitos_especiais?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  pautaData?: PautaData | null;
  loading?: boolean;
}

export interface CopyButtonProps {
  text: string;
  label: string;
}
