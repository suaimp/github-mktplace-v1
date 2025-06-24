import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

interface Order {
  id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  billing_name: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip_code: string;
  billing_document_number: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  niche?: any;
  service_content?: any;
  article_doc?: string;
  article_document_path?: string;
  article_url?: string;
  article_url_status?: "pending" | "sent";
  publication_status?: "approved" | "rejected" | "pending";
}

export function useOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [articleUrl, setArticleUrl] = useState<{ [key: string]: string }>({});
  const [urlInputTimeout, setUrlInputTimeout] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  useEffect(() => {
    if (id) {
      loadOrderDetails(id);
    }
  }, [id]);
  async function loadOrderDetails(orderId: string) {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Check if user is admin
      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      const userIsAdmin = !!adminData;

      // Build query based on user permissions
      let orderQuery = supabase.from("orders").select("*").eq("id", orderId);

      // If not admin, filter by user_id
      if (!userIsAdmin) {
        orderQuery = orderQuery.eq("user_id", user.id);
      }

      // Get order details
      const { data: orderData, error: orderError } = await orderQuery.single();

      if (orderError) {
        // If it's the specific error about multiple/no rows, provide more info
        if (orderError.message?.includes("multiple (or no) rows returned")) {
          throw new Error(
            `Pedido não encontrado ou você não tem permissão para visualizá-lo. ID do pedido: ${orderId}`
          );
        }
        throw orderError;
      }
      if (!orderData) throw new Error("Order not found");

      setOrder(orderData);

      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) {
        throw itemsError;
      }

      // Add mock data for the new columns (in a real app, these would come from the database)
      const itemsWithExtendedData = (itemsData || []).map(
        (item: any): OrderItem => ({
          ...item,
          article_doc: item.article_doc || null,
          article_document_path: item.article_document_path || null,
          article_url_status: item.article_url_status || "pending",
          publication_status: item.publication_status || "pending"
        })
      );

      setOrderItems(itemsWithExtendedData);

      // Inicializa article URLs
      const urls: { [key: string]: string } = {};
      itemsWithExtendedData.forEach((item: OrderItem) => {
        urls[item.id] = item.article_url || "";
      });
      setArticleUrl(urls);
    } catch (err: any) {
      console.error("Error loading order details:", err);
      setError(err.message || "Error loading order details");
    } finally {
      setLoading(false);
    }
  }

  const handleChangePublicationStatus = async (
    itemId: string,
    newStatus: string
  ) => {
    try {
      // Update the database
      const { error } = await supabase
        .from("order_items")
        .update({ publication_status: newStatus })
        .eq("id", itemId);

      if (error) throw error;

      // Update local state
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? ({ ...item, publication_status: newStatus } as OrderItem)
            : item
        )
      );
    } catch (error) {
      console.error("Error updating publication status:", error);
    }
  };

  const handleArticleUrlChange = (itemId: string, url: string) => {
    setArticleUrl((prev) => ({
      ...prev,
      [itemId]: url
    }));

    // Clear any existing timeout for this item
    if (urlInputTimeout[itemId]) {
      clearTimeout(urlInputTimeout[itemId]);
    }

    // Set a new timeout to submit the URL after typing stops
    const timeout = setTimeout(() => {
      handleArticleUrlSubmit(itemId);
    }, 1000); // 1 second delay

    setUrlInputTimeout((prev) => ({
      ...prev,
      [itemId]: timeout
    }));
  };

  const handleArticleUrlSubmit = async (itemId: string) => {
    try {
      if (!articleUrl[itemId] || articleUrl[itemId].trim() === "") {
        return;
      }

      // Update the database
      const { error } = await supabase
        .from("order_items")
        .update({
          article_url: articleUrl[itemId],
          article_url_status: "sent"
        })
        .eq("id", itemId);

      if (error) throw error;

      // Update local state
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                article_url: articleUrl[itemId],
                article_url_status: "sent"
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating article URL:", error);
    }
  };

  const openDocModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsDocModalOpen(true);
  };

  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setSelectedItemId(null);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || !selectedItemId) return;

    try {
      // Update the order item with the file info
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === selectedItemId
            ? { ...item, article_doc: file.name }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating file info:", error);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-400">
            Concluído
          </span>
        );
      case "processing":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-400">
            Processando
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-400">
            Cancelado
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-light-100 dark:bg-blue-light-900/20 text-blue-light-800 dark:text-blue-light-400">
            Pendente
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-400">
            Pago
          </span>
        );
      case "processing":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-400">
            Processando
          </span>
        );
      case "failed":
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-400">
            Falhou
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-light-100 dark:bg-blue-light-900/20 text-blue-light-800 dark:text-blue-light-400">
            Pendente
          </span>
        );
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Cartão de Crédito";
      case "pix":
        return "PIX";
      case "boleto":
        return "Boleto";
      default:
        return method;
    }
  };

  return {
    order,
    orderItems,
    loading,
    error,
    isDocModalOpen,
    selectedItemId,
    articleUrl,
    navigate,
    handleChangePublicationStatus,
    handleArticleUrlChange,
    handleArticleUrlSubmit,
    openDocModal,
    closeDocModal,
    handleFileUpload,
    formatDate,
    getStatusBadge,
    getPaymentStatusBadge,
    getPaymentMethodLabel
  };
}
