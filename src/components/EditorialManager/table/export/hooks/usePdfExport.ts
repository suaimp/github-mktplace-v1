import { useState } from 'react';
import { PdfExportService } from '../services/PdfExportService';
import { PdfExportData } from '../types/exportTypes';

/**
 * Hook para gerenciar a exportação de dados para PDF
 */
export function usePdfExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToPdf = async (data: PdfExportData): Promise<boolean> => {
    try {
      console.log('🎯 [usePdfExport] Iniciando exportação');
      console.log('📊 [usePdfExport] Dados recebidos:', {
        formTitle: data.formTitle,
        exportDate: data.exportDate,
        entriesCount: data.entries?.length || 0,
        fieldsCount: data.fields?.length || 0,
        totalEntries: data.totalEntries
      });

      setLoading(true);
      setError(null);

      // Validações
      if (!data.formTitle) {
        throw new Error('Título do formulário é obrigatório');
      }

      if (!data.entries || data.entries.length === 0) {
        throw new Error('Não há dados para exportar');
      }

      if (!data.fields || data.fields.length === 0) {
        throw new Error('Não há campos configurados para exportar');
      }

      console.log('✅ [usePdfExport] Validações passaram, chamando serviço...');
      await PdfExportService.generatePdf(data);
      console.log('🎉 [usePdfExport] Exportação concluída com sucesso');
      
      return true;
    } catch (err) {
      console.error('❌ [usePdfExport] Erro na exportação:', err);
      console.error('📊 [usePdfExport] Stack trace:', err instanceof Error ? err.stack : 'N/A');
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar PDF';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    exportToPdf,
    loading,
    error,
    clearError
  };
}
