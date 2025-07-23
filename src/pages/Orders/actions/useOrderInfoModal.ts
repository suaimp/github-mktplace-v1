import { useState } from "react";
import { useOrderDeletionWithFiles } from "../hooks/useOrderDeletionWithFiles";

export function useOrderInfoModal() {
  const [isOrderInfoModalOpen, setIsOrderInfoModalOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados for confirmation modal
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Hook para exclusão com arquivos
  const { deleteOrderWithFiles, navigateAfterDeletion } = useOrderDeletionWithFiles();

  const openOrderInfoModal = () => {
    setIsOrderInfoModalOpen(true);
    setDeleteError(null); // Clear any previous errors
  };
  const closeOrderInfoModal = () => {
    setIsOrderInfoModalOpen(false);
    setDeleteError(null);
  };

  // Confirmation modal functions
  const openConfirmDeleteModal = (orderId: string) => {
    setPendingOrderId(orderId);
    setIsConfirmDeleteModalOpen(true);
    setConfirmationText("");
    setDeleteError(null);
  };

  const closeConfirmDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false);
    setConfirmationText("");
    setPendingOrderId(null);
    setDeleteError(null);
  };

  const handleConfirmationTextChange = (text: string) => {
    setConfirmationText(text);
  };

  const isConfirmationValid =
    confirmationText.toLowerCase() === "excluir pedido";
  const deleteOrder = async () => {
    if (!pendingOrderId) {
      setDeleteError("ID do pedido não encontrado");
      return;
    }

    try {
      setIsDeletingOrder(true);
      setDeleteError(null);

      console.log("🗑️ Iniciando exclusão do pedido com arquivos:", pendingOrderId);
      
      // Usar o novo serviço de exclusão que inclui arquivos
      const result = await deleteOrderWithFiles(pendingOrderId);

      if (result.success) {
        console.log("✅ Pedido excluído com sucesso");

        // Fechar modais
        closeConfirmDeleteModal();
        closeOrderInfoModal();

        // Navegar com resultado da exclusão
        navigateAfterDeletion(result);
      } else {
        // Se houve erro, mostrar mensagem
        throw new Error(result.error || "Falha ao excluir o pedido e/ou arquivos associados");
      }
    } catch (error: any) {
      console.error("❌ Erro na exclusão do pedido:", error);
      let errorMessage = "Erro ao excluir pedido";
      
      // Detectar erros específicos de permissão
      if (error.message && error.message.includes("permission")) {
        errorMessage = "Você não tem permissão para excluir este pedido";
      } else if (error.message && error.message.includes("not found")) {
        errorMessage = "Pedido não encontrado";
      } else if (error.code === "42501") {
        errorMessage = "Sem permissão para excluir - faltam políticas de DELETE no banco";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setDeleteError(errorMessage);
    } finally {
      setIsDeletingOrder(false);
    }
  };
  return {
    isOrderInfoModalOpen,
    openOrderInfoModal,
    closeOrderInfoModal,
    deleteOrder,
    isDeletingOrder,
    deleteError,
    // Confirmation modal
    isConfirmDeleteModalOpen,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
    confirmationText,
    handleConfirmationTextChange,
    isConfirmationValid
  };
}
