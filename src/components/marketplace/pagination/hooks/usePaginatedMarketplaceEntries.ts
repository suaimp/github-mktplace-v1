import { useState, useEffect, useCallback } from "react";
import { MarketplaceEntriesService } from "../services/MarketplaceEntriesService";
import { MarketplacePaginationParams, MarketplacePaginatedResponse, MarketplaceEntry, MarketplaceCounts } from "../types";

export function usePaginatedMarketplaceEntries(formId?: string) {
  const [entries, setEntries] = useState<MarketplaceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState<MarketplaceCounts>({
    todos: 0,
    promocao: 0,
    favoritos: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTabId, setActiveTabId] = useState("todos");

  // Sorting state
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Load entries with current parameters
  const loadEntries = useCallback(async () => {
    if (!formId) return;

    try {
      setLoading(true);
      setError("");

      const params: MarketplacePaginationParams = {
        page: currentPage,
        limit: entriesPerPage,
        searchTerm: searchTerm || undefined,
        tabFilter: activeTabId !== 'todos' ? activeTabId : undefined,
        sortField,
        sortDirection,
        formId
      };

      const response: MarketplacePaginatedResponse<MarketplaceEntry> = await MarketplaceEntriesService.loadEntriesPaginated(params);
      
      setEntries(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

    } catch (err) {
      console.error("Error loading marketplace entries:", err);
      setError("Erro ao carregar produtos");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [formId, currentPage, entriesPerPage, searchTerm, activeTabId, sortField, sortDirection]);

  // Load counts
  const loadCounts = useCallback(async () => {
    if (!formId) return;

    try {
      const countsData = await MarketplaceEntriesService.loadMarketplaceCounts(formId);
      setCounts(countsData);
    } catch (err) {
      console.error("Error loading marketplace counts:", err);
    }
  }, [formId]);

  // Load entries when dependencies change
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Load counts when form changes
  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTabId, entriesPerPage]);

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
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

  const refreshEntries = () => {
    loadEntries();
    loadCounts();
  };

  return {
    // Data
    entries,
    loading,
    error,
    counts,
    
    // Pagination
    currentPage,
    entriesPerPage,
    totalPages,
    totalItems,
    
    // Filters
    searchTerm,
    activeTabId,
    
    // Sorting
    sortField,
    sortDirection,
    
    // Handlers
    handleSearch,
    handleTabChange,
    handleEntriesPerPageChange,
    handlePageChange,
    handleSort,
    refreshEntries,
    
    // Setters for direct control
    setCurrentPage,
    setEntriesPerPage,
    setSearchTerm,
    setActiveTabId
  };
}
