import { useState, useEffect, useCallback } from "react";
import { FormEntriesService } from "../services/FormEntriesService";
import { PaginationParams, PaginatedResponse, FormEntry, StatusCounts } from "../types";

export function usePaginatedEntries(formId?: string) {
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    todos: 0,
    em_analise: 0,
    verificado: 0,
    reprovado: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Sorting state
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load entries with current parameters
  const loadEntries = useCallback(async () => {
    if (!formId) {
      console.warn(`[usePaginatedEntries] loadEntries called without formId`);
      return;
    }

    try {
      console.log(`🔄 [usePaginatedEntries] Loading entries for form: ${formId}, page: ${currentPage}`);
      setLoading(true);
      setError("");

      const params: PaginationParams = {
        page: currentPage,
        limit: entriesPerPage,
        searchTerm: searchTerm || undefined,
        statusFilter: statusFilter !== 'todos' ? statusFilter : undefined,
        sortField,
        sortDirection,
        formId
      };

      const response: PaginatedResponse<FormEntry> = await FormEntriesService.loadEntriesPaginated(params);
      
      setEntries(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

      console.log(`✅ [usePaginatedEntries] Loaded ${response.data.length} entries, total: ${response.pagination.totalItems}`);

    } catch (err) {
      console.error("Error loading entries:", err);
      setError("Erro ao carregar entradas");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [formId, currentPage, entriesPerPage, searchTerm, statusFilter, sortField, sortDirection, refreshTrigger]);

  // Load status counts
  const loadStatusCounts = useCallback(async () => {
    if (!formId) return;

    try {
      const counts = await FormEntriesService.loadStatusCounts(formId);
      setStatusCounts(counts);
    } catch (err) {
      console.error("Error loading status counts:", err);
    }
  }, [formId]);

  // Load entries when dependencies change
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Load status counts when form changes
  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, entriesPerPage]);

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleEntriesPerPageChange = (newEntriesPerPage: number) => {
    setEntriesPerPage(newEntriesPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const refreshEntries = useCallback(() => {
    console.log(`🔄 [usePaginatedEntries] Refreshing entries for form: ${formId}`);
    setRefreshTrigger(prev => prev + 1);
    loadStatusCounts();
    console.log(`✅ [usePaginatedEntries] Refresh triggered successfully`);
  }, [formId, loadStatusCounts]);

  // Return all hook functionalities
  return {
    // Data
    entries,
    loading,
    error,
    statusCounts,
    
    // Pagination
    currentPage,
    entriesPerPage,
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
    handleEntriesPerPageChange,
    handlePageChange,
    handleSort,
    refreshEntries,
    
    // Setters for direct control
    setCurrentPage,
    setEntriesPerPage,
    setSearchTerm,
    setStatusFilter
  };
}
