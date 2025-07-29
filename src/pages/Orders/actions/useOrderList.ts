import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { showToast } from "../../../utils/toast";

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

export function useOrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Estados para ordenação
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Ensure current page is valid
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders when dependencies change
  useEffect(() => {
    let result = [...orders];

    // Apply search filter if search term exists
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((order) => {
        return (
          order.id.toLowerCase().includes(lowerSearchTerm) ||
          order.billing_name?.toLowerCase().includes(lowerSearchTerm) ||
          order.billing_email?.toLowerCase().includes(lowerSearchTerm) ||
          order.phone?.toLowerCase().includes(lowerSearchTerm) ||
          order.status.toLowerCase().includes(lowerSearchTerm) ||
          order.payment_method.toLowerCase().includes(lowerSearchTerm) ||
          order.payment_status.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }

    // Ordenação
    result.sort((a, b) => {
      let aValue: any = a[sortField as keyof Order];
      let bValue: any = b[sortField as keyof Order];
      // Para string, comparar lowercase
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }
      // Para número
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      // Para undefined/null
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      return 0;
    });

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [orders, searchTerm, sortField, sortDirection]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Verificar se o usuário é administrador
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userIsAdmin = profile?.role === "admin";
      setIsAdmin(userIsAdmin);

      let query = supabase.from("orders").select("*");

      if (userIsAdmin) {
        // Se for admin, busca todos os pedidos
        query = query.order("created_at", { ascending: false });
      } else {
        // Se não for admin, busca apenas os pedidos do usuário logado
        query = query
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      setError(err.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  }

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type} copiado!`, "success");
      console.log(`${type} copiado para a área de transferência: ${text}`);
    } catch (err) {
      console.error("Erro ao copiar para a área de transferência:", err);
      showToast("Erro ao copiar", "error");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOrdersPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setOrdersPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing orders per page
  };

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Função para alternar ordenação
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return {
    // State
    orders,
    filteredOrders,
    paginatedOrders,
    loading,
    error,
    isAdmin,
    searchTerm,
    ordersPerPage,
    currentPage,
    totalPages,
    sortField,
    sortDirection,

    // Functions
    handleViewOrder,
    copyToClipboard,
    formatDate,
    handleSearch,
    handleOrdersPerPageChange,
    setCurrentPage,
    loadOrders,
    handleSort,
    setSortField,
    setSortDirection
  };
}

export type { Order };
