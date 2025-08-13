import { useState, useEffect, useRef } from "react";
import { getFaviconUrl } from "../../../components/form/utils/formatters";
import InfoTooltip from "../../../components/ui/InfoTooltip/InfoTooltip";
import { SERVICE_OPTIONS } from "../../../components/Checkout/constants/options";
import { supabase } from "../../../lib/supabase";
import { PautaModal, usePautaModal } from "./PautaModal";
import { ArticleDetailsModal, useArticleDetailsModal } from "./ArticleDetailsModal";
import { SimpleChatModal } from "./SimpleChatModal";
import { ChatIcon, HorizontaLDots, ExternalLinkIcon } from "../../../icons";
import { OrderItemStatusService, OrderItemAnalyzer } from "./OrderItemsTable/index";

interface OrderItem {
  id: string;
  entry_id?: string;
  product_name: string;
  product_url: string;
  quantity: number;
  total_price: number;
  article_document_path?: string;
  article_doc?: string;
  article_url?: string;
  publication_status?: string;
  service_content?: any;
  outline?: any; // JSON data for article outline (pauta)
}

interface OrderItemsTableProps {
  orderId: string;
  isAdmin: boolean;
  onPackageModalOpen: (packageData: any) => void;
  onDocModalOpen: (itemId: string) => void;
  onUrlEditModalOpen: (itemId: string, currentUrl: string) => void;
  onDownloadFile: (path: string, filename: string, itemId: string) => void;
  onChangePublicationStatus: (itemId: string, status: string) => void;
  downloadLoading: { [key: string]: boolean };
  refreshTrigger?: number; // Prop para disparar refresh
}

export default function OrderItemsTable({
  orderId,
  isAdmin,
  onPackageModalOpen,
  onDocModalOpen,
  onUrlEditModalOpen,
  onDownloadFile,
  onChangePublicationStatus,
  downloadLoading,
  refreshTrigger,
}: OrderItemsTableProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  // Estado local para o status de publicação de cada item
  const [localStatus, setLocalStatus] = useState<{ [itemId: string]: string }>(
    {}
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Adicione estados para ordenação
  const [sortField, setSortField] = useState<string>("product_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Hook para o modal de pauta (com callback de refresh)
  const pautaModal = usePautaModal(() => setRefreshCounter(prev => prev + 1));

  // Hooks para os novos modais
  const articleDetailsModal = useArticleDetailsModal();
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedChatItem, setSelectedChatItem] = useState<OrderItem | null>(null);

  // Função para abrir o chat
  const handleOpenChat = (item: OrderItem) => {
    setSelectedChatItem(item);
    setChatModalOpen(true);
  };

  // Função para fechar o chat
  const handleCloseChat = () => {
    setChatModalOpen(false);
    setSelectedChatItem(null);
  };

  // Função para abrir detalhes do artigo
  const handleOpenArticleDetails = (item: OrderItem) => {
    articleDetailsModal.openModal(item.id, item.outline);
  };

  // Função para carregar os itens do pedido
  const loadOrderItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setOrderItems(data || []);
    } catch (err: any) {
      console.error("Error loading order items:", err);
      setError(err.message || "Erro ao carregar itens do pedido");
    } finally {
      setLoading(false);
    }
  }; // Carregar itens inicialmente
  useEffect(() => {
    if (orderId) {
      loadOrderItems();
    }
  }, [orderId]);

  // Listener para refresh manual
  useEffect(() => {
    if (refreshTrigger && orderId) {
      console.log("🔄 Refresh manual disparado:", refreshTrigger);
      loadOrderItems();
    }
  }, [refreshTrigger, orderId]);

  // Listener para refresh após envio de pauta
  useEffect(() => {
    if (refreshCounter > 0 && orderId) {
      console.log("🔄 Refresh após pauta enviada:", refreshCounter);
      loadOrderItems();
    }
  }, [refreshCounter, orderId]);

  // Atualiza o estado local sempre que os itens mudam
  useEffect(() => {
    const statusMap: { [itemId: string]: string } = {};
    orderItems.forEach((item) => {
      statusMap[item.id] = item.publication_status || "pending";
    });
    setLocalStatus(statusMap);
  }, [orderItems]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  // Função para alternar ordenação
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Ordenar os itens antes de renderizar
  const sortedOrderItems = [...orderItems].sort((a, b) => {
    let aValue: any = a[sortField as keyof OrderItem];
    let bValue: any = b[sortField as keyof OrderItem];

    // Para service_content, ordenar pelo título do pacote
    if (sortField === "service_content") {
      const getTitle = (val: any): string => {
        if (!val) return "";
        let serviceData: any = null;
        try {
          if (Array.isArray(val) && val.length > 0) {
            const jsonString = val[0];
            if (typeof jsonString === "string") serviceData = JSON.parse(jsonString);
            else if (typeof jsonString === "object") serviceData = jsonString;
          } else if (typeof val === "string") {
            serviceData = JSON.parse(val);
          } else if (typeof val === "object") {
            serviceData = val;
          }
        } catch {}
        return (serviceData && typeof serviceData.title === 'string') ? serviceData.title : "";
      };
      aValue = getTitle(aValue);
      bValue = getTitle(bValue);
    }

    // Para as novas colunas, ordenar como string
    if (["article_document_path", "article_url", "publication_status"].includes(sortField)) {
      aValue = aValue || "";
      bValue = bValue || "";
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

    // Para a coluna de ação, não altera a ordem
    if (sortField === "acao") {
      return 0;
    }

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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
            Itens do Pedido
          </h3>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
            Itens do Pedido
          </h3>
          <div className="text-center text-red-500 py-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
          Itens do Pedido
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("product_name")}
                >
                  <div className="flex items-center gap-1">
                    <span>Produto</span>
                    {sortField === "product_name" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("service_content")}
                >
                  <div className="flex items-center gap-1">
                    <span>Pacote de Conteúdo</span>
                    {sortField === "service_content" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
                {/* <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center gap-1">
                    <span>Quantidade</span>
                    {sortField === "quantity" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th> */}
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("article_document_path")}
                >
                  <div className="flex items-center gap-1">
                    <span>Artigo DOC</span>
                    {sortField === "article_document_path" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("article_url")}
                >
                  <div className="flex items-center gap-1">
                    <span>URL do Artigo</span>
                    <InfoTooltip text="A URL fica disponível após a publicação do artigo em um prazo de 3 a 5 dias" />
                    {sortField === "article_url" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("publication_status")}
                >
                  <div className="flex items-center gap-1">
                    <span>STATUS</span>
                    {sortField === "publication_status" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
                {/* Coluna para botões de ação */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {/* Sem título conforme solicitado */}
                </th>
                {isAdmin && (
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort("acao")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Ação</span>
                      {sortField === "acao" && (
                        <span className="flex flex-col gap-0.5 ml-1">
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                          </svg>
                          <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                          </svg>
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {/* <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort("total_price")}
                >
                  <div className="flex items-center gap-1">
                    <span>Total</span>
                    {sortField === "total_price" && (
                      <span className="flex flex-col gap-0.5 ml-1">
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" fill=""/>
                        </svg>
                        <svg className="fill-gray-300 dark:fill-gray-700" width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" fill=""/>
                        </svg>
                      </span>
                    )}
                  </div>
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {sortedOrderItems.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {item.product_url ? (
                      <div className="flex items-center">
                        <img
                          src={getFaviconUrl(item.product_url)}
                          alt="Site icon"
                          width="20"
                          height="20"
                          className="mr-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <a
                          href={
                            item.product_url.startsWith("http")
                              ? item.product_url
                              : `https://${item.product_url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                          {item.product_name || item.product_url}
                        </a>
                      </div>
                    ) : (
                      <span>{item.product_name}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(() => {
                      // Se não há service_content, exibir fallback simples
                      if (!item.service_content) {
                        return (
                          <span className="text-gray-500">
                            Pacote não especificado
                          </span>
                        );
                      }

                      let serviceData: any = null;

                      try {
                        // Formato esperado: ["{\"title\":\"Business\",\"price\":60,...}"]
                        if (
                          Array.isArray(item.service_content) &&
                          item.service_content.length > 0
                        ) {
                          // Pega o primeiro item do array e faz parse da string JSON
                          const jsonString = item.service_content[0];

                          if (typeof jsonString === "string") {
                            serviceData = JSON.parse(jsonString);
                          } else if (typeof jsonString === "object") {
                            serviceData = jsonString;
                          }
                        }
                        // Fallback para outros formatos
                        else if (typeof item.service_content === "string") {
                          serviceData = JSON.parse(item.service_content);
                        } else if (typeof item.service_content === "object") {
                          serviceData = item.service_content;
                        }
                      } catch (e) {
                        console.error(
                          "Erro ao fazer parse do service_content:",
                          e
                        );
                        return (
                          <span className="text-gray-500">
                            Erro no formato do pacote
                          </span>
                        );
                      }

                      if (!serviceData) {
                        return (
                          <span className="text-gray-500">
                            Dados do pacote indisponíveis
                          </span>
                        );
                      }

                      // Se for apenas as opções de "nenhum", não tornar clicável
                      if (
                        serviceData?.title === SERVICE_OPTIONS.LEGACY_NONE ||
                        serviceData?.title === SERVICE_OPTIONS.NONE
                      ) {
                        return (
                          <span className="text-gray-700 dark:text-gray-300 font-bold">
                            {serviceData.title}
                          </span>
                        );
                      }

                      return (
                        <button
                          onClick={() => onPackageModalOpen(serviceData)}
                          className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 hover:underline font-medium text-left flex items-center gap-2"
                          title="Clique para ver detalhes do pacote"
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {serviceData?.title || "Pacote sem título"}
                        </button>
                      );
                    })()}
                  </td>
                  {/* <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {item.quantity}
                  </td> */}
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(() => {
                      // Caso tenha arquivo enviado
                      if (item.article_document_path) {
                        return (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <button
                              onClick={() =>
                                onDownloadFile(
                                  item.article_document_path!,
                                  item.article_doc || "documento.docx",
                                  item.id
                                )
                              }
                              disabled={downloadLoading[item.id]}
                              className="flex items-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none"
                              style={{ textDecoration: "none", gap: "2px" }}
                              type="button"
                              title="Baixar artigo"
                            >
                              <span className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                                Artigo
                              </span>
                              <span className="ml-1 flex items-center">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    fill="none"
                                    stroke="currentColor"
                                  />
                                </svg>
                              </span>
                            </button>
                          </div>
                        );
                      }
                      // Caso article_doc contenha 'http' (link)
                      if (item.article_doc && typeof item.article_doc === "string" && item.article_doc.includes("http")) {
                        return (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <div className="flex items-center gap-1">
                              <a
                                href={item.article_doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center font-medium focus:outline-none"
                                style={{ textDecoration: "none" }}
                                title="Abrir artigo em nova aba"
                              >
                                Artigo
                              </a>
                              <button
                                onClick={() => window.open(item.article_doc!, '_blank')}
                                className="inline-flex items-center justify-center"
                                title="Abrir em nova aba"
                              >
                                <ExternalLinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer rounded" />
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(item.article_doc!);
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center"
                                title="Copiar link"
                                type="button"
                                style={{ marginLeft: "-2px" }}
                              >
                                <span className="sr-only">Copiar link</span>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M8.50391 4.25C8.50391 3.83579 8.83969 3.5 9.25391 3.5H15.2777C15.4766 3.5 15.6674 3.57902 15.8081 3.71967L18.2807 6.19234C18.4214 6.333 18.5004 6.52376 18.5004 6.72268V16.75C18.5004 17.1642 18.1646 17.5 17.7504 17.5H16.248V17.4993H14.748V17.5H9.25391C8.83969 17.5 8.50391 17.1642 8.50391 16.75V4.25ZM14.748 19H9.25391C8.01126 19 7.00391 17.9926 7.00391 16.75V6.49854H6.24805C5.83383 6.49854 5.49805 6.83432 5.49805 7.24854V19.75C5.49805 20.1642 5.83383 20.5 6.24805 20.5H13.998C14.4123 20.5 14.748 20.1642 14.748 19.75L14.748 19ZM7.00391 4.99854V4.25C7.00391 3.00736 8.01127 2 9.25391 2H15.2777C15.8745 2 16.4468 2.23705 16.8687 2.659L19.3414 5.13168C19.7634 5.55364 20.0004 6.12594 20.0004 6.72268V16.75C20.0004 17.9926 18.9931 19 17.7504 19H16.248L16.248 19.75C16.248 20.9926 15.2407 22 13.998 22H6.24805C5.00541 22 3.99805 20.9926 3.99805 19.75V7.24854C3.99805 6.00589 5.00541 4.99854 6.24805 4.99854H7.00391Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      }
                      // Caso não tenha nada, botão de enviar artigo/pauta
                      const hasPackage = OrderItemAnalyzer.hasPackageSelected(item);
                      const hasOutline = OrderItemAnalyzer.hasOutlineData(item);
                      
                      if (hasPackage && hasOutline && !isAdmin) {
                        // Se tem pauta, mostrar texto estático com check (apenas para usuário não-admin)
                        return (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-gray-100">Pauta enviada</span>
                          </div>
                        );
                      }
                      
                      let buttonText = "Enviar Artigo";
                      let buttonAction = () => onDocModalOpen(item.id);
                      
                      if (hasPackage && !hasOutline) {
                        // Se tem pacote mas não tem pauta, mostrar "Enviar Pauta"
                        buttonText = "Enviar Pauta";
                        buttonAction = () => pautaModal.openModal(item.id);
                      } else if (hasPackage && hasOutline && isAdmin) {
                        // Se tem pacote e pauta, admin vê "Enviar Artigo"
                        buttonText = "Enviar Artigo";
                        buttonAction = () => onDocModalOpen(item.id);
                      }
                      
                      return (
                        <button
                          onClick={buttonAction}
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center"
                        >
                          <svg
                            className="w-5 h-5 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          {buttonText}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      {item.article_url ? (
                        <>
                          <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <a
                            href={
                              item.article_url?.startsWith("http")
                                ? item.article_url
                                : `https://${item.article_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                          >
                            Publicado
                          </a>
                          <button
                            onClick={() => window.open(
                              item.article_url?.startsWith("http")
                                ? item.article_url
                                : `https://${item.article_url}`,
                              '_blank'
                            )}
                            className="inline-flex items-center justify-center"
                            title="Abrir em nova aba"
                          >
                            <ExternalLinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer rounded" />
                          </button>
                          <div className="relative -ml-1">
                            {isAdmin ? (
                              // Admin: ícone de opções (três pontos) com menu
                              <>
                                <button
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center"
                                  title="Opções"
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                >
                                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                                  </svg>
                                </button>
                                {openMenuId === item.id && (
                                  <div
                                    ref={menuRef}
                                    className="absolute z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs min-w-[100px] max-w-[140px] max-h-32 overflow-y-auto"
                                    style={{
                                      left: '100%',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      marginLeft: '8px',
                                      minWidth: 100,
                                      maxWidth: 140,
                                      fontSize: '0.85rem',
                                      padding: 0,
                                    }}
                                  >
                                    <button
                                      onClick={() => {
                                        onUrlEditModalOpen(item.id, item.article_url || "");
                                        setOpenMenuId(null);
                                      }}
                                      className="block w-full text-left px-3 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                      type="button"
                                      style={{ fontSize: '0.85rem' }}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.article_url!);
                                        setOpenMenuId(null);
                                      }}
                                      className="block w-full text-left px-3 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                      type="button"
                                      style={{ fontSize: '0.85rem' }}
                                    >
                                      Copiar
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              // Usuário comum: ícone de copiar direto
                              <button
                                onClick={() => navigator.clipboard.writeText(item.article_url!)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center"
                                title="Copiar URL"
                                type="button"
                              >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        // Se não há URL do artigo
                        isAdmin ? (
                          // Admin: mostra botão "Adicionar URL"
                          <button
                            onClick={() => onUrlEditModalOpen(item.id, "")}
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Adicionar URL
                          </button>
                        ) : (
                          // Usuário comum: mostra "Aguardando"
                          <span className="text-gray-500 dark:text-gray-400 italic">
                            Aguardando
                          </span>
                        )
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(() => {
                      // Usar o novo serviço de status
                      const context = OrderItemAnalyzer.extractStatusContext(item);
                      const status = OrderItemStatusService.determineStatus(context);
                      
                      return (
                        <span className={status.className}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </td>
                  {/* Coluna de botões de ação */}
                  <td className="whitespace-nowrap px-4 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {/* Botão de Chat - sempre visível */}
                      <button
                        onClick={() => handleOpenChat(item)}
                        className="p-2 transition-all duration-200 hover:opacity-80 hover:scale-105 bg-[#677f9b] dark:bg-slate-600 dark:hover:bg-slate-500"
                        style={{ borderRadius: '12px' }}
                        title="Abrir chat"
                      >
                        <ChatIcon className="w-5 h-5 text-white" />
                      </button>
                      {/* Botão de Detalhes - apenas para admin */}
                      {isAdmin && (
                        <button
                          onClick={() => handleOpenArticleDetails(item)}
                          className="relative p-2 transition-all duration-200 hover:opacity-80 hover:scale-105 bg-[#677f9b] dark:bg-slate-600 dark:hover:bg-slate-500"
                          style={{ borderRadius: '12px' }}
                          title="Ver detalhes do artigo"
                        >
                          <HorizontaLDots className="w-5 h-5 text-white" />
                          {/* Notificação até artigo ser enviado */}
                          {!OrderItemAnalyzer.hasArticleData(item) && (
                            <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-red-500 flex">
                              <span className="absolute -z-10 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <select
                        value={localStatus[item.id] || "pending"}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLocalStatus((prev) => ({
                            ...prev,
                            [item.id]: value,
                          }));
                          onChangePublicationStatus(item.id, value);
                        }}
                        className="block w-[calc(100%+4px)] rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm h-9"
                      >
                        <option value="pending">Pendente</option>
                        <option value="approved">Aprovar</option>
                        <option value="rejected">Reprovar</option>
                      </select>
                    </td>
                  )}
                  {/* <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {formatCurrency(item.total_price)}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Pauta */}
      <PautaModal
        isOpen={pautaModal.isOpen}
        onClose={pautaModal.closeModal}
        onSubmit={pautaModal.submitPauta}
        itemId={pautaModal.selectedItemId}
        loading={pautaModal.loading}
        submitError={pautaModal.submitError}
        mode={pautaModal.mode}
        initialData={pautaModal.initialData}
      />

      {/* Modal de Detalhes do Artigo */}
      <ArticleDetailsModal
        isOpen={articleDetailsModal.isOpen}
        onClose={articleDetailsModal.closeModal}
        itemId={articleDetailsModal.selectedItemId}
        pautaData={articleDetailsModal.pautaData}
        loading={articleDetailsModal.loading}
      />

      {/* Modal de Chat */}
      <SimpleChatModal
        isOpen={chatModalOpen}
        onClose={handleCloseChat}
        itemId={selectedChatItem?.id || ''}
        orderId={orderId}
        entryId={selectedChatItem?.entry_id}
        orderItemData={selectedChatItem ? {
          product_name: selectedChatItem.product_name,
          product_url: selectedChatItem.product_url
        } : undefined}
      />
    </div>
  );
}
