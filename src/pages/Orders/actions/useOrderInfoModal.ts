import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCompleteOrder } from "../../../services/db-services/marketplace-services/order/OrderService";

export function useOrderInfoModal() {
  const navigate = useNavigate();
  const [isOrderInfoModalOpen, setIsOrderInfoModalOpen] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // States for confirmation modal
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

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

      console.log("🗑️ Iniciando exclusão do pedido:", pendingOrderId);

      // Use the OrderService to delete the complete order (items + order)
      const success = await deleteCompleteOrder(pendingOrderId);

      if (!success) {
        throw new Error("Falha ao excluir o pedido. Tente novamente.");
      }
      console.log("✅ Pedido excluído com sucesso");

      // Close both modals
      closeConfirmDeleteModal();
      closeOrderInfoModal();

      // Show simple alert and navigate immediately
      alert("Pedido excluído com sucesso!");
      navigate("/orders");
    } catch (error: any) {
      console.error("❌ Erro na exclusão do pedido:", error);
      const errorMessage = error.message || "Erro ao excluir pedido";
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
