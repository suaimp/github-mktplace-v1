import { useState, useEffect, useCallback, useRef } from 'react';
import { PaginationCache } from './PaginationCache';
import { CacheKey, CacheConfig } from './types';

export interface UseCachedPaginationProps<T> {
  fetchFunction: (params: any) => Promise<{
    data: T[];
    pagination: {
      totalPages: number;
      totalItems: number;
    };
  }>;
  dependencies: any[];
  cacheConfig?: CacheConfig;
}

export function useCachedPagination<T>({
  fetchFunction,
  dependencies,
  cacheConfig
}: UseCachedPaginationProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  
  // Sorting state
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Cache instance
  const cacheRef = useRef(new PaginationCache<T>(cacheConfig));

  // Build cache key from current state
  const buildCacheKey = useCallback((): CacheKey => ({
    page: currentPage,
    searchTerm: searchTerm || undefined,
    statusFilter: statusFilter !== 'todos' ? statusFilter : undefined,
    sortField,
    sortDirection,
    formId: dependencies[0] // Assume first dependency is formId/entityId
  }), [currentPage, searchTerm, statusFilter, sortField, sortDirection, dependencies]);

  // Load data with cache check
  const loadData = useCallback(async () => {
    const cacheKey = buildCacheKey();
    const cachedEntry = cacheRef.current.get(cacheKey);

    if (cachedEntry) {
      // Use cached data
      setData(cachedEntry.data);
      setTotalPages(cachedEntry.totalPages);
      setTotalItems(cachedEntry.totalItems);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        searchTerm: searchTerm || undefined,
        statusFilter: statusFilter !== 'todos' ? statusFilter : undefined,
        sortField,
        sortDirection,
        formId: dependencies[0], // Pass the main dependency (formId/entityId)
        ...dependencies.reduce((acc, dep, index) => {
          acc[`dep_${index}`] = dep;
          return acc;
        }, {})
      };

      const response = await fetchFunction(params);
      
      // Cache the response
      cacheRef.current.set(cacheKey, response.data, response.pagination.totalItems, response.pagination.totalPages);
      
      setData(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erro ao carregar dados");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, buildCacheKey, currentPage, itemsPerPage, searchTerm, statusFilter, sortField, sortDirection, dependencies]);

  // Load data when dependencies change
  useEffect(() => {
    if (dependencies[0]) { // Only load if main dependency exists
      loadData();
    }
  }, [loadData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // Invalidate cache when dependencies change (except page changes)
  useEffect(() => {
    cacheRef.current.invalidate({ formId: dependencies[0] });
  }, dependencies);

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // OTIMIZAÇÃO: Não invalidar todo o cache, apenas recarregar
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    // OTIMIZAÇÃO: Não invalidar todo o cache, apenas recarregar
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    // Invalidar cache apenas quando mudamos items per page (layout change)
    cacheRef.current.clear();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Não limpar cache ao mudar página - é o principal benefício do cache
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    // OTIMIZAÇÃO: Não limpar todo cache ao ordenar, deixar que expire naturalmente
  };

  const refreshData = () => {
    // Clear cache and reload
    cacheRef.current.clear();
    loadData();
  };

  const clearCache = () => {
    cacheRef.current.clear();
  };

  return {
    // Data
    data,
    loading,
    error,
    
    // Pagination
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    
    // Filters
    searchTerm,
    statusFilter,
    
    // Sorting
    sortField,
    sortDirection,
    
    // Handlers
    handleSearch,
    handleStatusFilter,
    handleItemsPerPageChange,
    handlePageChange,
    handleSort,
    refreshData,
    clearCache,
    
    // Setters for direct control
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setStatusFilter,

    // Cache info
    cacheSize: cacheRef.current.size()
  };
}
