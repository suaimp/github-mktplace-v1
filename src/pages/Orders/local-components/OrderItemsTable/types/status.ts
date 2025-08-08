/**
 * Tipos para status de itens do pedido
 * Responsabilidade: Definir os tipos e estruturas dos status
 */

export type OrderItemStatusType = 
  | 'article_pending'    // Artigo pendente
  | 'pauta_pending'      // Aguardando pauta  
  | 'pauta_sent'         // Pauta enviada
  | 'article_sent'       // Artigo enviado
  | 'in_preparation'     // Em preparação
  | 'published'          // Publicado
  | 'rejected'           // Reprovado
  | 'pending'            // Pendente (fallback)

export interface OrderItemStatus {
  type: OrderItemStatusType;
  label: string;
  className: string;
  description?: string;
}

export interface OrderItemStatusContext {
  hasPackage: boolean;
  hasOutline: boolean;
  hasArticle: boolean;
  hasArticleUrl: boolean;
  publicationStatus: string;
  isRejected: boolean;
  isPublished: boolean;
}
