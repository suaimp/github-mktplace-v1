import { useState } from 'react';
import { FormEntriesService } from '../../pagination/services/FormEntriesService';

interface UseAllEntriesForExportParams {
  formId: string;
  statusFilter: string;
  searchTerm: string;
}

interface UseAllEntriesForExportReturn {
  loading: boolean;
  error: string | null;
  getAllEntries: () => Promise<any[]>;
  getStatusDisplayName: (status: string) => string;
}

/**
 * Hook para buscar todos os entries de uma aba específica para exportação
 * Não aplica paginação, retorna todos os registros filtrados
 */
export function useAllEntriesForExport({
  formId,
  statusFilter,
  searchTerm
}: UseAllEntriesForExportParams): UseAllEntriesForExportReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusDisplayName = (status: string): string => {
    const statusMap: Record<string, string> = {
      'todos': 'Todos os Status',
      'em_analise': 'Em Análise',
      'verificado': 'Verificado',
      'reprovado': 'Reprovado'
    };
    return statusMap[status] || status;
  };

  const getAllEntries = async (): Promise<any[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 [useAllEntriesForExport] Buscando todos os entries para exportação:`, {
        formId,
        statusFilter,
        searchTerm,
        statusDisplayName: getStatusDisplayName(statusFilter)
      });

      // Buscar TODOS os entries com limite alto para pegar tudo
      const result = await FormEntriesService.loadEntriesPaginated({
        page: 1,
        limit: 10000, // Limite alto para pegar todos os registros
        formId,
        statusFilter,
        searchTerm,
        sortField: 'created_at',
        sortDirection: 'desc'
      });

      console.log(`✅ [useAllEntriesForExport] Entries carregados:`, {
        count: result.data.length,
        totalItems: result.pagination.totalItems
      });

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar entries para exportação';
      console.error(`❌ [useAllEntriesForExport] Erro:`, err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllEntries,
    getStatusDisplayName
  };
}
