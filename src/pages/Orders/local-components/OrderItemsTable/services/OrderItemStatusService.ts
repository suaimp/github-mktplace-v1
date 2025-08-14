/**
 * Serviço para determinar status de itens do pedido
 * Responsabilidade: Lógica de negócio para status
 */

import { OrderItemStatus, OrderItemStatusContext, OrderItemStatusType } from '../types/status';

export class OrderItemStatusService {
  
  /**
   * Mapa de configurações de status
   */
  private static readonly STATUS_CONFIG: Record<OrderItemStatusType, OrderItemStatus> = {
    payment_pending: {
      type: 'payment_pending',
      label: 'Pagamento Pendente',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400'
    },
    rejected: {
      type: 'rejected',
      label: 'Reprovado',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
    },
    published: {
      type: 'published',
      label: 'Artigo Publicado',
      // url do artigo já publicado (após publicação)
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
    },
    publication_pending: {
      type: 'publication_pending',
      label: 'Publicação Pendente',
      // artigo enviado (upload ou link), mas ainda não publicado (sem url do artigo)
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    },
    article_sent: {
      type: 'article_sent',
      label: 'Artigo Enviado',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    pauta_sent: {
      type: 'pauta_sent',
      label: 'Pauta Enviada',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    in_preparation: {
      type: 'in_preparation',
      label: 'Em preparação',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-gray-500 text-white dark:bg-white/5 dark:text-white'
    },
    pauta_pending: {
      type: 'pauta_pending',
      label: 'Aguardando Pauta',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-gray-500 text-white dark:bg-white/5 dark:text-white'
    },
    article_pending: {
      type: 'article_pending',
      label: 'Artigo Pendente',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400'
    },
    pending: {
      type: 'pending',
      label: 'Pendente',
      className: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
    }
  };

  /**
   * Determina o status de um item baseado no contexto
   */
  static determineStatus(context: OrderItemStatusContext): OrderItemStatus {
    console.log('🔍 [OrderItemStatusService] Determinando status com contexto:', {
      paymentStatus: context.paymentStatus,
      hasPackage: context.hasPackage,
      hasOutline: context.hasOutline,
      hasArticle: context.hasArticle,
      hasArticleUrl: context.hasArticleUrl,
      isRejected: context.isRejected
    });

    // 0. PRIORIDADE MÁXIMA: Verificar se pagamento está pendente
    if (context.paymentStatus === "pending") {
      console.log('✅ [OrderItemStatusService] Retornando status: Pagamento Pendente');
      return this.STATUS_CONFIG.payment_pending;
    }

    // 1. Verificar status críticos
    if (context.isRejected) {
      console.log('➡️ [OrderItemStatusService] Retornando status: Reprovado');
      return this.STATUS_CONFIG.rejected;
    }

    // 2. Publicado APENAS quando admin adiciona URL do artigo publicado
    if (context.hasArticleUrl) {
      console.log('➡️ [OrderItemStatusService] Retornando status: Artigo Publicado');
      return this.STATUS_CONFIG.published;
    }

    // 3. Se artigo foi enviado (upload ou link), mas ainda não publicado (sem url)
    // Artigo doc = artigo antes de ser publicado (upload ou link)
    if (context.hasArticle) {
      console.log('➡️ [OrderItemStatusService] Retornando status: Publicação Pendente');
      return this.STATUS_CONFIG.publication_pending;
    }

    // 4. Se tem pacote, avaliar fluxo de pauta
    if (context.hasPackage) {
      // Se tem pauta enviada -> Em preparação
      if (context.hasOutline) {
        console.log('➡️ [OrderItemStatusService] Retornando status: Em preparação');
        return this.STATUS_CONFIG.in_preparation;
      }
      
      // Se tem pacote mas não tem pauta nem artigo
      console.log('➡️ [OrderItemStatusService] Retornando status: Aguardando Pauta');
      return this.STATUS_CONFIG.pauta_pending;
    }

    // 5. Se não tem pacote, aguarda artigo
    console.log('➡️ [OrderItemStatusService] Retornando status: Artigo Pendente');
    return this.STATUS_CONFIG.article_pending;
  }

  /**
   * Obtém a configuração de um status específico
   */
  static getStatusConfig(type: OrderItemStatusType): OrderItemStatus {
    return this.STATUS_CONFIG[type];
  }

  /**
   * Lista todos os tipos de status disponíveis
   */
  static getAllStatusTypes(): OrderItemStatusType[] {
    return Object.keys(this.STATUS_CONFIG) as OrderItemStatusType[];
  }
}
