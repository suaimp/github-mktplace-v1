/**
 * Hook para gerenciar o modal de pauta
 */

import { useState } from 'react';
import { PautaFormData } from '../types';
import { usePautaSubmit } from './usePautaSubmit';
import { OutlineService } from '../services/OutlineService';

export function usePautaModal(onSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'view'>('create');
  const [initialData, setInitialData] = useState<PautaFormData | undefined>(undefined);
  
  // Usar o hook de submit
  const { isSubmitting, submitError, submitPauta, clearError } = usePautaSubmit();

  /**
   * Abre o modal para enviar pauta (modo create)
   */
  const openModal = async (itemId: string) => {
    setSelectedItemId(itemId);
    setMode('create');
    setInitialData(undefined);
    setIsOpen(true);
    clearError();
  };

  /**
   * Abre o modal para visualizar pauta existente (modo view)
   */
  const openViewModal = async (itemId: string, outlineData?: any) => {
    try {
      setSelectedItemId(itemId);
      setMode('view');
      
      // Se outlineData foi fornecido, usar diretamente
      if (outlineData) {
        console.log('📋 Dados outline recebidos:', outlineData);
        
        // Converter de formato DB para formato do formulário
        const convertedData = {
          palavraChave: outlineData.palavra_chave || '',
          urlSite: outlineData.url_site || '',
          textoAncora: outlineData.texto_ancora || '',
          requisitosEspeciais: outlineData.requisitos_especiais || ''
        };
        
        console.log('🔄 Dados convertidos para formulário:', convertedData);
        setInitialData(convertedData);
      } else {
        // Fallback: carregar do banco
        const existingData = await OutlineService.getOutline(itemId);
        if (existingData) {
          setInitialData({
            palavraChave: existingData.palavra_chave || '',
            urlSite: existingData.url_site || '',
            textoAncora: existingData.texto_ancora || '',
            requisitosEspeciais: existingData.requisitos_especiais || ''
          });
        }
      }
      
      setIsOpen(true);
      clearError();
    } catch (error) {
      console.error('Erro ao carregar dados da pauta:', error);
    }
  };

  /**
   * Fecha o modal
   */
  const closeModal = () => {
    setIsOpen(false);
    setSelectedItemId('');
    setMode('create');
    setInitialData(undefined);
    clearError();
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
      onSuccess?.(); // Chamar callback de sucesso se fornecido
    }
  };

  return {
    isOpen,
    selectedItemId,
    mode,
    initialData,
    loading: isSubmitting, // Compatibilidade com interface existente
    submitError,
    openModal,
    openViewModal, // Nova função para modo view
    closeModal,
    submitPauta: handleSubmitPauta,
    clearError
  };
}
