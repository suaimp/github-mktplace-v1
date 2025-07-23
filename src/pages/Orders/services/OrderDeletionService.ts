import { ArticleDocumentsService } from "../../../services/buckets-services/articleDocumentsService";
import { OrderItemService } from "../../../services/db-services/marketplace-services/order/OrderItemService";

/**
 * Interface para representar um item de pedido com documento de artigo
 */
export interface OrderItemWithDocument {
  id: string;
  article_document_path?: string;
  article_doc?: string;
}

/**
 * Interface para resultado da exclusão de arquivos
 */
export interface ArticleDeletionResult {
  success: boolean;
  deletedFiles: string[];
  failedFiles: Array<{
    path: string;
    error: string;
  }>;
}

/**
 * Serviço responsável por gerenciar a exclusão de arquivos associados aos pedidos
 */
export class OrderDeletionService {
  /**
   * Obtém todos os arquivos de artigos associados a um pedido específico
   * @param orderId ID do pedido
   * @returns Lista de itens com documentos de artigos
   */
  static async getOrderArticleDocuments(orderId: string): Promise<OrderItemWithDocument[]> {
    try {
      console.log("🔍 Buscando documentos de artigos para o pedido:", orderId);
      
      const orderItems = await OrderItemService.listOrderItemsByOrder(orderId);
      
      if (!orderItems || orderItems.length === 0) {
        console.log("📄 Nenhum item encontrado para o pedido:", orderId);
        return [];
      }

      // Filtrar apenas itens que possuem documentos de artigos
      const itemsWithDocuments = orderItems.filter(
        (item) => item.article_document_path && item.article_document_path.trim() !== ""
      );

      console.log(
        `📄 Encontrados ${itemsWithDocuments.length} itens com documentos de artigos para o pedido ${orderId}`
      );

      return itemsWithDocuments.map((item) => ({
        id: item.id,
        article_document_path: item.article_document_path,
        article_doc: item.article_doc,
      }));
    } catch (error) {
      console.error("❌ Erro ao buscar documentos de artigos do pedido:", error);
      throw new Error(`Falha ao buscar documentos de artigos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Exclui todos os arquivos de artigos associados a uma lista de itens
   * @param items Lista de itens com documentos
   * @returns Resultado da operação de exclusão
   */
  static async deleteArticleDocuments(items: OrderItemWithDocument[]): Promise<ArticleDeletionResult> {
    const result: ArticleDeletionResult = {
      success: true,
      deletedFiles: [],
      failedFiles: [],
    };

    if (!items || items.length === 0) {
      console.log("📄 Nenhum documento de artigo para excluir");
      return result;
    }

    console.log(`🗑️ Iniciando exclusão de ${items.length} documentos de artigos...`);

    for (const item of items) {
      if (!item.article_document_path) {
        continue;
      }

      try {
        console.log(`🗑️ Excluindo arquivo: ${item.article_document_path}`);
        
        const { error } = await ArticleDocumentsService.deleteFile(item.article_document_path);
        
        if (error) {
          throw new Error(error.message || "Erro ao excluir arquivo do bucket");
        }

        result.deletedFiles.push(item.article_document_path);
        console.log(`✅ Arquivo excluído com sucesso: ${item.article_document_path}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        
        console.error(`❌ Erro ao excluir arquivo ${item.article_document_path}:`, errorMessage);
        
        result.failedFiles.push({
          path: item.article_document_path,
          error: errorMessage,
        });
        
        // Se houver falhas, marcar como não totalmente bem-sucedido
        result.success = false;
      }
    }

    console.log(`📊 Resumo da exclusão de arquivos:`, {
      arquivosExcluidos: result.deletedFiles.length,
      arquivosFalharam: result.failedFiles.length,
      sucessoTotal: result.success,
    });

    return result;
  }

  /**
   * Executa a exclusão completa de todos os arquivos de artigos de um pedido
   * @param orderId ID do pedido
   * @returns Resultado da operação de exclusão
   */
  static async deleteOrderArticleDocuments(orderId: string): Promise<ArticleDeletionResult> {
    try {
      console.log("🚀 Iniciando exclusão de documentos de artigos para o pedido:", orderId);
      
      // 1. Buscar todos os documentos associados ao pedido
      const items = await this.getOrderArticleDocuments(orderId);
      
      if (items.length === 0) {
        console.log("📄 Nenhum documento de artigo encontrado para excluir");
        return {
          success: true,
          deletedFiles: [],
          failedFiles: [],
        };
      }

      // 2. Excluir todos os arquivos encontrados
      const deletionResult = await this.deleteArticleDocuments(items);
      
      // 3. Log do resultado final
      if (deletionResult.success) {
        console.log(
          `✅ Todos os documentos de artigos foram excluídos com sucesso para o pedido ${orderId}`
        );
      } else {
        console.warn(
          `⚠️ Alguns documentos de artigos falharam ao ser excluídos para o pedido ${orderId}:`,
          deletionResult.failedFiles
        );
      }

      return deletionResult;
    } catch (error) {
      console.error("❌ Erro na exclusão de documentos de artigos:", error);
      
      return {
        success: false,
        deletedFiles: [],
        failedFiles: [
          {
            path: "N/A",
            error: error instanceof Error ? error.message : "Erro desconhecido",
          },
        ],
      };
    }
  }
}
