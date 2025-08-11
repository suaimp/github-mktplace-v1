/**
 * Hook para gerenciar o modal de chat
 */

import { useState, useCallback } from 'react';

export function useChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>(undefined);

  /**
   * Abre o modal de chat
   */
  const openModal = useCallback((itemId: string, orderId: string, entryId?: string) => {
    setSelectedItemId(itemId);
    setSelectedOrderId(orderId);
    setSelectedEntryId(entryId);
    setIsOpen(true);
  }, []);

  /**
   * Fecha o modal de chat
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItemId('');
    setSelectedOrderId('');
    setSelectedEntryId(undefined);
  }, []);

  return {
    isOpen,
    selectedItemId,
    selectedOrderId,
    selectedEntryId,
    openModal,
    closeModal
  };
}
