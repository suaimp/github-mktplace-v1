/**
 * Hook para gerenciar o modal de pauta
 */

import { useState } from 'react';
import { PautaFormData } from '../types';
import { usePautaSubmit } from './usePautaSubmit';

export function usePautaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  
  // Usar o hook de submit
  const { isSubmitting, submitError, submitPauta, clearError } = usePautaSubmit();

  /**
   * Abre o modal para um item específico
   */
  const openModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsOpen(true);
    clearError(); // Limpar erros ao abrir
  };

  /**
   * Fecha o modal
   */
  const closeModal = () => {
    setIsOpen(false);
    setSelectedItemId('');
    clearError(); // Limpar erros ao fechar
  };

  /**
   * Submete a pauta usando o novo sistema
   */
  const handleSubmitPauta = async (data: PautaFormData) => {
    if (!selectedItemId) {
      console.error('❌ Item ID não encontrado');
      return;
    }

    const success = await submitPauta(selectedItemId, data);
    
    if (success) {
      closeModal(); // Fechar modal apenas se sucesso
    }
  };

  return {
    isOpen,
    selectedItemId,
    loading: isSubmitting, // Compatibilidade com interface existente
    submitError,
    openModal,
    closeModal,
    submitPauta: handleSubmitPauta,
    clearError
  };
}
