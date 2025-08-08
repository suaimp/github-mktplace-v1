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
    rejected: {
      type: 'rejected',
      label: 'Reprovado',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
    },
    published: {
      type: 'published',
  label: 'Artigo Publicado',
      className: 'inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
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
    // 1. Primeiro, verificar status críticos
    if (context.isRejected) {
      return this.STATUS_CONFIG.rejected;
    }


    // 2. Publicado APENAS quando admin adiciona URL do artigo publicado
    if (context.hasArticleUrl) {
      return this.STATUS_CONFIG.published;
    }

    // 3. Se tem artigo enviado (doc ou link) -> Em preparação
    if (context.hasArticle) {
      return this.STATUS_CONFIG.in_preparation;
    }

    // 4. Se tem pacote, avaliar fluxo de pauta
    if (context.hasPackage) {
      // Se tem pauta enviada -> Em preparação
      if (context.hasOutline) {
        return this.STATUS_CONFIG.in_preparation;
      }
      
      // Se tem pacote mas não tem pauta nem artigo
      return this.STATUS_CONFIG.pauta_pending;
    }

    // 5. Se não tem pacote, aguarda artigo
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
