/**
 * Hook para gerenciar o submit do formulário de pauta
 * Responsabilidade única: lógica de envio e estado do submit
 */

import { useState } from 'react';
import { PautaFormData } from '../types';
import { OutlineService } from '../services/OutlineService';

export function usePautaSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitPauta = async (itemId: string, formData: PautaFormData): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      console.log('🚀 Iniciando submit da pauta');
      console.log('📄 Item ID:', itemId);
      console.log('📋 Form Data:', formData);

      // Validar dados antes do envio
      if (!itemId) {
        throw new Error('ID do item é obrigatório');
      }

      if (!formData.palavraChave.trim()) {
        throw new Error('Palavra-chave é obrigatória');
      }

      if (!formData.urlSite.trim()) {
        throw new Error('URL do site é obrigatória');
      }

      if (!formData.textoAncora.trim()) {
        throw new Error('Texto âncora é obrigatório');
      }

      // Salvar outline no banco de dados
      await OutlineService.saveOutline(itemId, formData);

      console.log('✅ Pauta enviada com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao enviar pauta:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao enviar pauta';
      
      setSubmitError(errorMessage);
      return false;

    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setSubmitError(null);
  };

  return {
    isSubmitting,
    submitError,
    submitPauta,
    clearError
  };
}
