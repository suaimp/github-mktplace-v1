import { useCallback, useMemo } from "react";
import { useCachedPagination } from "../../../../hooks/cache";
import { FormEntriesService } from "../services/FormEntriesService";
import { PaginationParams, PaginatedResponse, FormEntry, StatusCounts } from "../types";
import { useState, useEffect } from "react";

export function useCachedPaginatedEntries(formId?: string) {
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    todos: 0,
    em_analise: 0,
    verificado: 0,
    reprovado: 0
  });

  // OTIMIZAÇÃO: Memoizar a função de fetch para evitar recriações
  const fetchEntries = useCallback(async (params: PaginationParams) => {
    console.log(`🔄 [useCachedPaginatedEntries] Fetching entries for formId: ${formId}`);
    const response: PaginatedResponse<FormEntry> = await FormEntriesService.loadEntriesPaginated(params);
    console.log(`✅ [useCachedPaginatedEntries] Fetched ${response.data.length} entries`);
    return response;
  }, [formId]);

  // OTIMIZAÇÃO: Configuração de cache otimizada
  const cacheConfig = useMemo(() => ({
    maxAge: 3 * 60 * 1000, // Reduzido para 3 minutos (dados mais atualizados)
    maxEntries: 50 // Reduzido para economizar memória
  }), []);

  // Use cached pagination hook
  const paginationResult = useCachedPagination<FormEntry>({
    fetchFunction: fetchEntries,
    dependencies: [formId],
    cacheConfig
  });

  // OTIMIZAÇÃO: Load status counts apenas quando necessário
  const loadStatusCounts = useCallback(async () => {
    if (!formId) return;

    try {
      console.log(`📊 [useCachedPaginatedEntries] Loading status counts for formId: ${formId}`);
      const counts = await FormEntriesService.loadStatusCounts(formId);
      setStatusCounts(counts);
      console.log(`✅ [useCachedPaginatedEntries] Status counts loaded:`, counts);
    } catch (err) {
      console.error("Error loading status counts:", err);
    }
  }, [formId]);

  // Load status counts when form changes
  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  // Enhanced refresh function that also refreshes status counts
  const refreshEntries = useCallback(() => {
    console.log(`🔄 [useCachedPaginatedEntries] Refreshing entries and status counts`);
    paginationResult.refreshData();
    loadStatusCounts();
  }, [paginationResult.refreshData, loadStatusCounts]);

  // OTIMIZAÇÃO: Memoizar o objeto de retorno para evitar re-renders
  return useMemo(() => ({
    // Data
    entries: paginationResult.data,
    loading: paginationResult.loading,
    error: paginationResult.error,
    statusCounts,
    
    // Pagination
    currentPage: paginationResult.currentPage,
    entriesPerPage: paginationResult.itemsPerPage,
    totalPages: paginationResult.totalPages,
    totalItems: paginationResult.totalItems,
    
    // Filters
    searchTerm: paginationResult.searchTerm,
    statusFilter: paginationResult.statusFilter,
    
    // Sorting
    sortField: paginationResult.sortField,
    sortDirection: paginationResult.sortDirection,
    
    // Handlers
    handleSearch: paginationResult.handleSearch,
    handleStatusFilter: paginationResult.handleStatusFilter,
    handleEntriesPerPageChange: paginationResult.handleItemsPerPageChange,
    handlePageChange: paginationResult.handlePageChange,
    handleSort: paginationResult.handleSort,
    refreshEntries,
    
    // Setters for direct control
    setCurrentPage: paginationResult.setCurrentPage,
    setEntriesPerPage: paginationResult.setItemsPerPage,
    setSearchTerm: paginationResult.setSearchTerm,
    setStatusFilter: paginationResult.setStatusFilter,

    // Cache utilities
    clearCache: paginationResult.clearCache,
    cacheSize: paginationResult.cacheSize
  }), [
    paginationResult.data,
    paginationResult.loading,
    paginationResult.error,
    statusCounts,
    paginationResult.currentPage,
    paginationResult.itemsPerPage,
    paginationResult.totalPages,
    paginationResult.totalItems,
    paginationResult.searchTerm,
    paginationResult.statusFilter,
    paginationResult.sortField,
    paginationResult.sortDirection,
    paginationResult.handleSearch,
    paginationResult.handleStatusFilter,
    paginationResult.handleItemsPerPageChange,
    paginationResult.handlePageChange,
    paginationResult.handleSort,
    refreshEntries,
    paginationResult.setCurrentPage,
    paginationResult.setItemsPerPage,
    paginationResult.setSearchTerm,
    paginationResult.setStatusFilter,
    paginationResult.clearCache,
    paginationResult.cacheSize
  ]);
}
