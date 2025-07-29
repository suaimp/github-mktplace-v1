import { useCallback } from "react";
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

  // Create the fetch function for cached pagination
  const fetchEntries = useCallback(async (params: PaginationParams) => {
    const response: PaginatedResponse<FormEntry> = await FormEntriesService.loadEntriesPaginated(params);
    return response;
  }, []);

  // Use cached pagination hook
  const paginationResult = useCachedPagination<FormEntry>({
    fetchFunction: fetchEntries,
    dependencies: [formId],
    cacheConfig: {
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 100 // Allow more entries for forms with many pages
    }
  });

  // Load status counts separately (not cached as it's less expensive)
  const loadStatusCounts = useCallback(async () => {
    if (!formId) return;

    try {
      const counts = await FormEntriesService.loadStatusCounts(formId);
      setStatusCounts(counts);
    } catch (err) {
      console.error("Error loading status counts:", err);
    }
  }, [formId]);

  // Load status counts when form changes
  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  // Enhanced refresh function that also refreshes status counts
  const refreshEntries = () => {
    paginationResult.refreshData();
    loadStatusCounts();
  };

  return {
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
  };
}
