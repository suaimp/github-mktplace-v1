/**
 * Utilitários para análise de itens do pedido
 * Responsabilidade: Extrair informações de contexto dos itens
 */

import { OrderItemStatusContext } from '../types/status';

// Interface do OrderItem (importada do arquivo principal)
interface OrderItem {
  id: string;
  service_content?: any;
  outline?: any;
  article_document_path?: string;
  article_doc?: string;
  article_url?: string;
  publication_status?: string;
}

export class OrderItemAnalyzer {
  
  /**
   * Verifica se o item tem um pacote selecionado
   */
  static hasPackageSelected(item: OrderItem): boolean {
    try {
      let serviceData: any = null;
      
      if (Array.isArray(item.service_content) && item.service_content.length > 0) {
        const jsonString = item.service_content[0];
        if (typeof jsonString === "string") {
          serviceData = JSON.parse(jsonString);
        } else if (typeof jsonString === "object") {
          serviceData = jsonString;
        }
      } else if (typeof item.service_content === "string") {
        serviceData = JSON.parse(item.service_content);
      } else if (typeof item.service_content === "object") {
        serviceData = item.service_content;
      }

      return serviceData && serviceData.benefits && serviceData.benefits.length > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Verifica se o item tem outline (pauta) enviada
   */
  static hasOutlineData(item: OrderItem): boolean {
    return !!(item.outline && typeof item.outline === 'object' && Object.keys(item.outline).length > 0);
  }

  /**
   * Verifica se o item tem artigo enviado
   */
  static hasArticleData(item: OrderItem): boolean {
    return !!(item.article_document_path || item.article_doc);
  }

  /**
   * Verifica se o item tem URL de artigo publicado
   */
  static hasArticleUrl(item: OrderItem): boolean {
    return !!(item.article_url && item.article_url.trim().length > 0);
  }

  /**
   * Verifica se o item foi rejeitado
   */
  static isRejected(item: OrderItem): boolean {
    return item.publication_status === "rejected";
  }

  /**
   * Verifica se o item foi publicado/aprovado
   */
  static isPublished(item: OrderItem): boolean {
    return item.publication_status === "approved";
  }

  /**
   * Extrai o contexto completo de um item para determinação de status
   */
  static extractStatusContext(item: OrderItem): OrderItemStatusContext {
    return {
      hasPackage: this.hasPackageSelected(item),
      hasOutline: this.hasOutlineData(item),
      hasArticle: this.hasArticleData(item),
      hasArticleUrl: this.hasArticleUrl(item),
      publicationStatus: item.publication_status || '',
      isRejected: this.isRejected(item),
      isPublished: this.isPublished(item)
    };
  }
}
