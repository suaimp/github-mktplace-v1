// ⚠️ DEPRECATED - NÃO USAR - Cache removido
// Use useOrderList.ts em vez deste arquivo
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { showToast } from "../../../utils/toast";
import { useCachedPagination } from "../../../hooks/cache";

interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  billing_name: string;
  billing_email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export function useCachedOrderList() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Create fetch function for pagination
  const fetchOrders = useCallback(async (params: any) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw new Error("Erro de autenticação");
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user?.id)
      .single();

    const isUserAdmin = profile?.role === "admin";
    setIsAdmin(isUserAdmin);

    // Fetch orders based on admin status
    let query = supabase.from("orders").select("*");

    if (!isUserAdmin) {
      query = query.eq("user_id", user?.id);
    }

    // Apply search filter if provided
    if (params.searchTerm) {
      query = query.or(`billing_name.ilike.%${params.searchTerm}%,billing_email.ilike.%${params.searchTerm}%,id.ilike.%${params.searchTerm}%`);
    }

    // Apply status filter if provided
    if (params.statusFilter && params.statusFilter !== 'todos') {
      query = query.eq('status', params.statusFilter);
    }

    // Apply sorting
    if (params.sortField) {
      query = query.order(params.sortField, { ascending: params.sortDirection === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: orders, error } = await query;

    if (error) {
      throw new Error("Erro ao carregar pedidos");
    }

    const totalItems = orders?.length || 0;
    const totalPages = Math.ceil(totalItems / params.limit);

    // Apply pagination
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedData = orders?.slice(startIndex, endIndex) || [];

    return {
      data: paginatedData,
      pagination: {
        totalPages,
        totalItems
      }
    };
  }, []);

  // Use cached pagination
  const paginationResult = useCachedPagination<Order>({
    fetchFunction: fetchOrders,
    dependencies: [], // No specific dependencies for orders
    cacheConfig: {
      maxAge: 2 * 60 * 1000, // 2 minutes for orders (more dynamic data)
      maxEntries: 50
    }
  });

  // Debug: Log cache info (remova em produção)
  console.log(`📊 Orders Cache Status: ${paginationResult.cacheSize} páginas em cache`);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    paginationResult.handleSearch(event.target.value);
  };

  const handleOrdersPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    paginationResult.handleItemsPerPageChange(parseInt(event.target.value));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copiado para a área de transferência!", "success");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return {
    // Data
    paginatedOrders: paginationResult.data,
    filteredOrders: paginationResult.data, // For compatibility
    loading: paginationResult.loading,
    error: paginationResult.error,
    isAdmin,
    
    // Pagination
    currentPage: paginationResult.currentPage,
    ordersPerPage: paginationResult.itemsPerPage,
    totalPages: paginationResult.totalPages,
    
    // Filters and search
    searchTerm: paginationResult.searchTerm,
    
    // Sorting
    sortField: paginationResult.sortField,
    sortDirection: paginationResult.sortDirection,
    
    // Handlers
    handleSearch,
    handleOrdersPerPageChange,
    setCurrentPage: paginationResult.setCurrentPage,
    handleSort: paginationResult.handleSort,
    handleViewOrder,
    copyToClipboard,
    formatDate,

    // Cache utilities
    refreshOrders: paginationResult.refreshData,
    clearCache: paginationResult.clearCache
  };
}
