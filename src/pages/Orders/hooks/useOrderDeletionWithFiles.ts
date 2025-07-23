import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCompleteOrder } from "../../../services/db-services/marketplace-services/order/OrderService";
import { OrderDeletionService, type ArticleDeletionResult } from "../services/OrderDeletionService";

/**
 * Interface para o estado de exclusão
 */
export interface OrderDeletionState {
  isDeleting: boolean;
  error: string | null;
  articleDeletionResult?: ArticleDeletionResult;
}

/**
 * Interface para o resultado da exclusão completa
 */
export interface CompleteOrderDeletionResult {
  success: boolean;
  orderDeleted: boolean;
  articleDeletionResult: ArticleDeletionResult;
  error?: string;
}

/**
 * Hook personalizado para gerenciar a exclusão de pedidos incluindo arquivos associados
 */
export function useOrderDeletionWithFiles() {
  const navigate = useNavigate();
  const [deletionState, setDeletionState] = useState<OrderDeletionState>({
    isDeleting: false,
    error: null,
  });

  /**
   * Executa a exclusão completa de um pedido incluindo seus arquivos
   * @param orderId ID do pedido a ser excluído
   * @returns Resultado da operação de exclusão
   */
  const deleteOrderWithFiles = async (orderId: string): Promise<CompleteOrderDeletionResult> => {
    setDeletionState({
      isDeleting: true,
      error: null,
    });

    try {
      console.log("🚀 Iniciando exclusão completa do pedido com arquivos:", orderId);

      // 1. Primeiro, excluir os arquivos de artigos associados
      console.log("📄 Passo 1: Excluindo documentos de artigos...");
      const articleDeletionResult = await OrderDeletionService.deleteOrderArticleDocuments(orderId);

      // 2. Em seguida, excluir o pedido do banco de dados
      console.log("🗑️ Passo 2: Excluindo pedido do banco de dados...");
      const orderDeleted = await deleteCompleteOrder(orderId);

      if (!orderDeleted) {
        throw new Error("Falha ao excluir o pedido do banco de dados");
      }

      // 3. Avaliar o resultado geral
      const overallSuccess = orderDeleted && articleDeletionResult.success;

      const result: CompleteOrderDeletionResult = {
        success: overallSuccess,
        orderDeleted,
        articleDeletionResult,
      };

      // 4. Log do resultado
      if (overallSuccess) {
        console.log("✅ Exclusão completa do pedido realizada com sucesso!");
      } else {
        console.warn("⚠️ Exclusão do pedido realizada com algumas falhas:", {
          orderDeleted,
          articleDeletionSuccess: articleDeletionResult.success,
          failedFiles: articleDeletionResult.failedFiles,
        });
      }

      setDeletionState({
        isDeleting: false,
        error: null,
        articleDeletionResult,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido na exclusão";
      
      console.error("❌ Erro na exclusão completa do pedido:", errorMessage);
      
      setDeletionState({
        isDeleting: false,
        error: errorMessage,
      });

      return {
        success: false,
        orderDeleted: false,
        articleDeletionResult: {
          success: false,
          deletedFiles: [],
          failedFiles: [
            {
              path: "N/A",
              error: errorMessage,
            },
          ],
        },
        error: errorMessage,
      };
    }
  };

  /**
   * Navega de volta para a lista de pedidos com mensagem de sucesso ou erro
   * @param result Resultado da exclusão
   */
  const navigateAfterDeletion = (result: CompleteOrderDeletionResult) => {
    if (result.success) {
      // Sucesso completo
      navigate("/orders", {
        state: {
          deletionSuccess: true,
          message: "Pedido e arquivos associados excluídos com sucesso!",
        },
      });
    } else if (result.orderDeleted && !result.articleDeletionResult.success) {
      // Pedido excluído, mas falha nos arquivos
      const failedCount = result.articleDeletionResult.failedFiles.length;
      navigate("/orders", {
        state: {
          deletionSuccess: true,
          message: `Pedido excluído com sucesso! Atenção: ${failedCount} arquivo(s) não puderam ser removidos do storage.`,
        },
      });
    } else {
      // Falha geral
      navigate("/orders", {
        state: {
          deletionSuccess: false,
          message: result.error || "Erro ao excluir pedido. Tente novamente.",
        },
      });
    }
  };

  /**
   * Limpa o estado de erro
   */
  const clearError = () => {
    setDeletionState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  return {
    deletionState,
    deleteOrderWithFiles,
    navigateAfterDeletion,
    clearError,
    isDeleting: deletionState.isDeleting,
    error: deletionState.error,
  };
}
