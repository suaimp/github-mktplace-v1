import { useRef, useState } from "react";
import { deleteServiceCard } from "../../../context/db-context/services/serviceCardService";

export function useCardActions(
  setCards: any,
  setLoading: any,
  id: string | undefined,
  getServiceCards: any
) {
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
    handleDelete
  };
}
