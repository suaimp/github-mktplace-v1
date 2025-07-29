import { useCallback, useState } from "react";
import { useCachedPagination } from "../../../hooks/cache";
import { supabase } from "../../../lib/supabase";

interface MarketplaceEntry {
  id: string;
  form_id: string;
  values: Record<string, any>;
  created_at: string;
  status: string;
  [key: string]: any;
}

interface MarketplaceField {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  [key: string]: any;
}

export function useCachedMarketplaceData(formId: string) {
  const [fields, setFields] = useState<MarketplaceField[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  // Create fetch function for marketplace data
  const fetchMarketplaceData = useCallback(async (params: any) => {
    if (!formId) {
      throw new Error("Form ID é obrigatório");
    }

    try {
      // Load form fields first
      const { data: formFields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('sort_order');

      if (fieldsError) {
        throw new Error("Erro ao carregar campos do formulário");
      }

      setFields(formFields || []);

      // Build query for entries
      let query = supabase
        .from('form_entries')
        .select(`
          id,
          form_id,
          values,
          created_at,
          status,
          publisher:profiles!form_entries_created_by_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('form_id', formId)
        .eq('status', 'verificado'); // Only verified entries for marketplace

      // Apply search filter if provided
      if (params.searchTerm) {
        // Search in JSON values - this is a simple approach
        query = query.ilike('values', `%${params.searchTerm}%`);
      }

      // Apply status filter if provided (for tabs)
      if (params.statusFilter && params.statusFilter !== 'todos') {
        if (params.statusFilter === 'promocao') {
          // Filter entries with promotional prices
          // This would need to be implemented based on your product field structure
        }
        if (params.statusFilter === 'favoritos') {
          // Filter favorited entries - implement when favorites feature is ready
        }
      }

      // Apply sorting
      if (params.sortField) {
        query = query.order(params.sortField, { ascending: params.sortDirection === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        throw new Error("Erro ao carregar entradas do marketplace");
      }

      const allEntries = entries || [];
      const totalItems = allEntries.length;
      const totalPages = Math.ceil(totalItems / params.limit);

      // Apply pagination
      const startIndex = (params.page - 1) * params.limit;
      const endIndex = startIndex + params.limit;
      const paginatedData = allEntries.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          totalPages,
          totalItems
        }
      };

    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      throw error;
    }
  }, [formId]);

  // Use cached pagination
  const paginationResult = useCachedPagination<MarketplaceEntry>({
    fetchFunction: fetchMarketplaceData,
    dependencies: [formId],
    cacheConfig: {
      maxAge: 5 * 60 * 1000, // 5 minutes - marketplace data doesn't change as frequently
      maxEntries: 100
    }
  });

  // Enhanced debug logging
  console.log(`🛒 Marketplace Cache Status:`, {
    formId,
    cacheSize: paginationResult.cacheSize,
    currentPage: paginationResult.currentPage,
    isLoading: paginationResult.loading,
    timestamp: new Date().toLocaleTimeString()
  });

  // Selection handlers
  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = () => {
    setSelectedEntries(
      selectedEntries.length === paginationResult.data.length 
        ? [] 
        : paginationResult.data.map(entry => entry.id)
    );
  };

  const handleClearSelection = () => {
    setSelectedEntries([]);
  };

  // Tab counts calculation
  const calculateTabCounts = () => {
    const allEntries = paginationResult.data;
    
    // Find product field for promotional price calculation
    const productField = fields.find(f => f.field_type === 'product');
    
    const promocaoCount = allEntries.filter((entry) => {
      if (productField) {
        const productData = entry.values[productField.id];
        if (productData && typeof productData === 'object') {
          const promotionalPrice = productData.promotional_price || productData.price_promotional;
          return promotionalPrice && parseFloat(promotionalPrice) > 0;
        }
      }
      return false;
    }).length;

    const favoritosCount = 0; // Implement when favorites feature is ready

    return {
      todos: allEntries.length,
      promocao: promocaoCount,
      favoritos: favoritosCount
    };
  };

  return {
    // Data
    entries: paginationResult.data,
    fields,
    loading: paginationResult.loading,
    error: paginationResult.error,
    
    // Pagination
    currentPage: paginationResult.currentPage,
    itemsPerPage: paginationResult.itemsPerPage,
    totalPages: paginationResult.totalPages,
    totalItems: paginationResult.totalItems,
    
    // Filters and search
    searchTerm: paginationResult.searchTerm,
    statusFilter: paginationResult.statusFilter,
    
    // Sorting
    sortField: paginationResult.sortField,
    sortDirection: paginationResult.sortDirection,
    
    // Selection
    selectedEntries,
    
    // Handlers
    handleSearch: paginationResult.handleSearch,
    handleStatusFilter: paginationResult.handleStatusFilter,
    handleItemsPerPageChange: paginationResult.handleItemsPerPageChange,
    handlePageChange: paginationResult.handlePageChange,
    handleSort: paginationResult.handleSort,
    handleSelectEntry,
    handleSelectAll,
    handleClearSelection,
    
    // Setters for direct control
    setCurrentPage: paginationResult.setCurrentPage,
    setItemsPerPage: paginationResult.setItemsPerPage,
    setSearchTerm: paginationResult.setSearchTerm,
    setStatusFilter: paginationResult.setStatusFilter,

    // Utilities
    refreshData: paginationResult.refreshData,
    clearCache: paginationResult.clearCache,
    cacheSize: paginationResult.cacheSize,
    calculateTabCounts
  };
}
