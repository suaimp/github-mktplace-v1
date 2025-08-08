/**
 * Hook para gerenciar o modal de pauta
 */

import { useState } from 'react';
import { PautaService, PautaFormData } from '../../../../../services/db-services/marketplace-services/order/PautaService';
import { showToast } from '../../../../../utils/toast';

export function usePautaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /**
   * Abre o modal para um item específico
   */
  const openModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsOpen(true);
  };

  /**
   * Fecha o modal
   */
  const closeModal = () => {
    setIsOpen(false);
    setSelectedItemId('');
    setLoading(false);
  };

  /**
   * Submete a pauta
   */
  const submitPauta = async (data: PautaFormData) => {
    if (!selectedItemId) {
      console.error('❌ Item ID não encontrado');
      return;
    }

    try {
      setLoading(true);
      
      console.log('📝 Enviando pauta:', { itemId: selectedItemId, data });

      // Verifica se já existe uma pauta para este item
      const existingPauta = await PautaService.getPautaByItemId(selectedItemId);
      
      let result;
      if (existingPauta) {
        // Atualiza pauta existente
        result = await PautaService.updatePauta(selectedItemId, data);
        showToast('Pauta atualizada com sucesso!', 'success');
      } else {
        // Cria nova pauta
        result = await PautaService.createPauta(selectedItemId, data);
        showToast('Pauta enviada com sucesso!', 'success');
      }

      console.log('✅ Pauta processada com sucesso:', result);
      
      closeModal();
    } catch (error) {
      console.error('❌ Erro ao enviar pauta:', error);
      showToast('Erro ao enviar pauta. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    selectedItemId,
    loading,
    openModal,
    closeModal,
    submitPauta
  };
}
