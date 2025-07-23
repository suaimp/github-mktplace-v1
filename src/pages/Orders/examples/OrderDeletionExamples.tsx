/**
 * Exemplo de uso da funcionalidade de exclusão de pedidos com arquivos
 * 
 * Este arquivo demonstra como integrar a nova funcionalidade de exclusão
 * de arquivos do bucket article_documents quando pedidos são excluídos.
 */

import { useState } from "react";
import { 
  useOrderDeletionWithFiles, 
  OrderDeletionNotification,
  type CompleteOrderDeletionResult 
} from "../index";

/**
 * Exemplo 1: Uso básico do hook de exclusão
 */
function BasicOrderDeletionExample() {
  const { deleteOrderWithFiles, isDeleting, error } = useOrderDeletionWithFiles();
  const [orderId] = useState("example-order-id");

  const handleDeleteOrder = async () => {
    try {
      const result = await deleteOrderWithFiles(orderId);
      
      if (result.success) {
        console.log("✅ Pedido e arquivos excluídos com sucesso!");
        console.log(`📄 Arquivos excluídos: ${result.articleDeletionResult.deletedFiles.length}`);
      } else {
        console.warn("⚠️ Exclusão realizada com avisos:", result.error);
      }
    } catch (err) {
      console.error("❌ Erro na exclusão:", err);
    }
  };

  return (
    <div>
      <button 
        onClick={handleDeleteOrder}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Excluir Pedido"}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600">
          Erro: {error}
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo 2: Uso com notificação detalhada
 */
function DetailedOrderDeletionExample() {
  const { deleteOrderWithFiles, isDeleting } = useOrderDeletionWithFiles();
  const [orderId] = useState("example-order-id");
  const [showNotification, setShowNotification] = useState(false);
  const [deletionResult, setDeletionResult] = useState<CompleteOrderDeletionResult | null>(null);

  const handleDeleteWithNotification = async () => {
    try {
      const result = await deleteOrderWithFiles(orderId);
      
      // Armazenar resultado para mostrar na notificação
      setDeletionResult(result);
      setShowNotification(true);
      
      // Auto-ocultar notificação após 5 segundos
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
    } catch (err) {
      console.error("Erro na exclusão:", err);
    }
  };

  return (
    <div>
      <button 
        onClick={handleDeleteWithNotification}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Excluir com Notificação"}
      </button>

      {/* Notificação detalhada */}
      <OrderDeletionNotification
        isVisible={showNotification}
        result={deletionResult?.articleDeletionResult || null}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

/**
 * Exemplo 3: Manipulação manual dos serviços
 */
import { OrderDeletionService } from "../services/OrderDeletionService";

async function manualOrderDeletionExample(orderId: string) {
  try {
    // 1. Buscar documentos do pedido
    const documents = await OrderDeletionService.getOrderArticleDocuments(orderId);
    console.log(`📄 Encontrados ${documents.length} documentos para excluir`);

    // 2. Excluir documentos (se houver)
    if (documents.length > 0) {
      const result = await OrderDeletionService.deleteArticleDocuments(documents);
      
      console.log("📊 Resultado da exclusão de arquivos:");
      console.log(`✅ Sucessos: ${result.deletedFiles.length}`);
      console.log(`❌ Falhas: ${result.failedFiles.length}`);
      
      // Listar falhas se houver
      if (result.failedFiles.length > 0) {
        console.log("⚠️ Arquivos que falharam:");
        result.failedFiles.forEach(failure => {
          console.log(`  - ${failure.path}: ${failure.error}`);
        });
      }
    }

    // 3. Aqui você excluiria o pedido usando o serviço original
    // const orderDeleted = await deleteCompleteOrder(orderId);

    console.log("✅ Processo de exclusão manual concluído");

  } catch (error) {
    console.error("❌ Erro no processo manual:", error);
  }
}

/**
 * Exemplo 4: Verificação de arquivos antes da exclusão
 */
async function checkFilesBeforeDeletion(orderId: string) {
  try {
    // Verificar quais arquivos serão afetados
    const documents = await OrderDeletionService.getOrderArticleDocuments(orderId);
    
    if (documents.length === 0) {
      console.log("📄 Este pedido não possui arquivos para excluir");
      return false;
    }

    console.log("📄 Arquivos que serão excluídos:");
    documents.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.article_document_path}`);
      console.log(`     Nome: ${doc.article_doc || 'N/A'}`);
    });

    // Retornar true se houver arquivos para confirmar com usuário
    return true;

  } catch (error) {
    console.error("❌ Erro ao verificar arquivos:", error);
    return false;
  }
}

// Exportar exemplos para uso
export {
  BasicOrderDeletionExample,
  DetailedOrderDeletionExample,
  manualOrderDeletionExample,
  checkFilesBeforeDeletion
};
