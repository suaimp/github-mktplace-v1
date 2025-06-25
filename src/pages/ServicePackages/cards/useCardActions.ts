import { useRef, useState } from "react";
import {
  deleteServiceCard,
  updateCardsOrder
} from "../../../services/db-services/marketplace-services/card/serviceCardService";
import {
  defaultCardColors,
  mainCardColors
} from "../../../components/ServicePackages/cards/cardColors";

export function useCardActions(setCards: any, setLoading: any) {
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const editModalTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleEdit = (cardId: string) => {
    setEditCardId(cardId);
    setEditModalVisible(true);
    setTimeout(() => setShowEditModal(true), 10);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    if (editModalTimeout.current) clearTimeout(editModalTimeout.current);
    editModalTimeout.current = setTimeout(() => {
      setEditModalVisible(false);
    }, 300);
  };

  const handleDelete = async (cardId: string) => {
    const ok = window.confirm("Tem certeza que deseja excluir este pacote?");
    if (!ok) return;
    setLoading(true);
    const success = await deleteServiceCard(cardId);
    if (success) {
      setCards((prev: any) => prev.filter((c: any) => c.id !== cardId));
    } else {
      alert("Erro ao excluir pacote.");
    }
    setLoading(false);
  };

  // Novo: Atualiza a ordem dos cards no banco e no estado
  const handleCardsOrderChange = async (newOrder: any[]) => {
    setCards(newOrder);
    await updateCardsOrder(
      newOrder.map((card, idx) => ({
        id: card.id,
        order_layout: idx
      }))
    );
    // Opcional: feedback
    console.log("Ordem salva no banco!");
  };

  // Novo: Alterna o layout do card (tema visual)
  const handleToggleCardLayout = (cardId: string, isMain: boolean) => {
    setCards((prev: any[]) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, cardColors: isMain ? mainCardColors : defaultCardColors }
          : c
      )
    );
  };

  return {
    editCardId,
    setEditCardId,
    showEditModal,
    setShowEditModal,
    editModalVisible,
    setEditModalVisible,
    editModalTimeout,
    handleEdit,
    handleCloseEditModal,
    handleDelete,
    handleCardsOrderChange, // exporta o novo método
    handleToggleCardLayout
  };
}
