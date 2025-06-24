import { useState, useEffect } from "react";
import { formatCurrency } from "../../../components/marketplace/utils";
import { getFaviconUrl } from "../../../components/form/utils/formatters";
import InfoTooltip from "../../../components/ui/InfoTooltip/InfoTooltip";
import { SERVICE_OPTIONS } from "../../../components/Checkout/constants/options";
import { supabase } from "../../../lib/supabase";

interface OrderItem {
  id: string;
  product_name: string;
  product_url: string;
  quantity: number;
  total_price: number;
  article_document_path?: string;
  article_doc?: string;
  article_url?: string;
  publication_status?: string;
  service_content?: any;
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
  refreshTrigger
}: OrderItemsTableProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Calcular total
      const total = (data || []).reduce(
        (sum, item) => sum + (item.total_price || 0),
        0
      );
      setTotalAmount(total);
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pacote
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Artigo DOC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <span>URL do Artigo</span>
                    <InfoTooltip text="A URL fica disponível após a publicação do artigo em um prazo de 3 a 5 dias" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status de Publicação
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ação
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {orderItems.map((item) => (
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
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {item.quantity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {item.article_document_path ? (
                      <button
                        onClick={() =>
                          onDownloadFile(
                            item.article_document_path!,
                            item.article_doc || "documento.docx",
                            item.id
                          )
                        }
                        disabled={downloadLoading[item.id]}
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadLoading[item.id] ? (
                          <svg
                            className="animate-spin w-5 h-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
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
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                        {downloadLoading[item.id]
                          ? "Baixando..."
                          : "Baixar Artigo"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onDocModalOpen(item.id)}
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
                        Enviar Artigo
                      </button>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        {item.article_url ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={item.article_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-800 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 underline"
                            >
                              Link do artigo publicado
                            </a>
                            <button
                              onClick={() =>
                                onUrlEditModalOpen(
                                  item.id,
                                  item.article_url || ""
                                )
                              }
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                              title="Editar URL"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
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
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {item.article_url ? (
                          <a
                            href={item.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 underline"
                          >
                            Abrir Artigo
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400">
                            Pendente
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {item.publication_status === "approved" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400">
                        Aprovado
                      </span>
                    ) : item.publication_status === "rejected" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400">
                        Reprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400">
                        Pendente
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <select
                        value={item.publication_status || "pending"}
                        onChange={(e) =>
                          onChangePublicationStatus(item.id, e.target.value)
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="pending">Pendente</option>
                        <option value="approved">Aprovar</option>
                        <option value="rejected">Reprovar</option>
                      </select>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="px-4 py-4 text-right font-medium text-gray-700 dark:text-gray-300"
                >
                  Total:
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-800 dark:text-white font-semibold">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
