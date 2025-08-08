/**
 * Hook para gerenciar o modal de detalhes do artigo
 */

import { useState, useCallback } from 'react';
import { PautaData } from '../types';

export function useArticleDetailsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [pautaData, setPautaData] = useState<PautaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Abre o modal com dados do outline diretos
   */
  const openModal = useCallback((itemId: string, outlineData?: any) => {
    setSelectedItemId(itemId);
    setIsOpen(true);
    setLoading(false);
    setError(null);

    // Se tiver dados do outline, usar diretamente
    if (outlineData) {
      const formattedData: PautaData = {
        id: itemId,
        order_item_id: itemId,
        palavra_chave: outlineData.palavra_chave || '',
        url_site: outlineData.url_site || '',
        texto_ancora: outlineData.texto_ancora || '',
        requisitos_especiais: outlineData.requisitos_especiais || '',
        created_at: outlineData.created_at || new Date().toISOString(),
        updated_at: outlineData.updated_at || new Date().toISOString()
      };
      setPautaData(formattedData);
    } else {
      setPautaData(null);
    }
  }, []);

  /**
   * Fecha o modal
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItemId('');
    setPautaData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    isOpen,
    selectedItemId,
    pautaData,
    loading,
    error,
    openModal,
    closeModal
  };
}
