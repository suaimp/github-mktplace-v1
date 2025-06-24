import { useOrderDetailLogic } from "./actions/useOrderDetailLogic";
import { useOrderInfoModal } from "./actions/useOrderInfoModal";
import Button from "../../components/ui/button/Button";
import { formatCurrency } from "../../components/marketplace/utils";
import { getFaviconUrl } from "../../components/form/utils/formatters";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import { useState, useEffect } from "react";
import OrderInfoModal from "./local-components/OrderInfoModal";
import OrderProgress from "./local-components/OrderProgress";
import { supabase } from "../../lib/supabase";
import InfoTooltip from "../../components/ui/InfoTooltip/InfoTooltip";
import { SERVICE_OPTIONS } from "../../components/Checkout/constants/options";

export default function OrderDetail() {
  const [isAdmin, setIsAdmin] = useState(false);
  // Estado para o modal de edição de URL do artigo
  const [isUrlEditModalOpen, setIsUrlEditModalOpen] = useState(false);
  const [selectedItemForUrlEdit, setSelectedItemForUrlEdit] =
    useState<string>("");
  const [editingArticleUrl, setEditingArticleUrl] = useState("");

  // Estado para o modal de informações do pacote
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<any>(null);

  const {
    isOrderInfoModalOpen,
    openOrderInfoModal,
    closeOrderInfoModal,
    deleteOrder,
    isDeletingOrder,
    deleteError,
    isConfirmDeleteModalOpen,
    openConfirmDeleteModal,
    closeConfirmDeleteModal
  } = useOrderInfoModal();

  const {
    order,
    orderItems,
    loading,
    error,
    isDocModalOpen,
    navigate,
    handleChangePublicationStatus,
    openDocModal,
    closeDocModal,
    formatDate,
    getStatusBadge,
    getPaymentStatusBadge,
    getPaymentMethodLabel,
    fileInputRef,
    selectedFile,
    uploadLoading,
    uploadError,
    uploadSuccess,
    handleFileChange,
    handleUploadClick,
    handleUploadSubmit,
    downloadLoading,
    downloadError,
    handleDownloadFile,
    clearDownloadError,
    confirmingBoleto,
    handleConfirmBoletoPayment,
    sendArticleUrl // <-- nova função
  } = useOrderDetailLogic();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: adminData } = await supabase
          .from("admins")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        setIsAdmin(!!adminData);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdminStatus();
  }, []);

  // Funções para o modal de edição de URL do artigo
  const openUrlEditModal = (itemId: string, currentUrl: string = "") => {
    setSelectedItemForUrlEdit(itemId);
    setEditingArticleUrl(currentUrl);
    setIsUrlEditModalOpen(true);
  };
  const closeUrlEditModal = () => {
    setIsUrlEditModalOpen(false);
    setSelectedItemForUrlEdit("");
    setEditingArticleUrl("");
  };

  // Funções para o modal de informações do pacote
  const openPackageModal = (packageData: any) => {
    setSelectedPackageData(packageData);
    setIsPackageModalOpen(true);
  };

  const closePackageModal = () => {
    setIsPackageModalOpen(false);
    setSelectedPackageData(null);
  };
  const handleSaveArticleUrl = async () => {
    if (!selectedItemForUrlEdit) return;

    try {
      await sendArticleUrl(selectedItemForUrlEdit, editingArticleUrl);
      closeUrlEditModal();
    } catch (error) {
      console.error("Erro ao salvar URL do artigo:", error);
    }
  };

  // Função para determinar a etapa atual do progresso
  const getCurrentProgressStep = () => {
    // Etapa 1: Compra - sempre completa se há um pedido
    if (!order) return 1;

    // Etapa 2: Pagamento
    if (order.payment_status !== "paid") return 2;

    // Etapa 3: Artigo - verificar se todos os itens têm documentos
    const hasAllDocuments = orderItems.every(
      (item) => item.article_document_path
    );
    if (!hasAllDocuments) return 3;

    // Etapa 4: Publicação - verificar se todos os itens têm URLs
    const hasAllUrls = orderItems.every((item) => item.article_url);
    if (!hasAllUrls) return 4;

    // Todas as etapas concluídas
    return 4;
  };

  // Verificar se há pelo menos um documento de artigo
  const hasAnyArticleDocument = orderItems.some(
    (item) => item.article_document_path
  );

  // Verificar se há pelo menos uma URL de artigo
  const hasAnyArticleUrl = orderItems.some((item) => item.article_url);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Erro ao Carregar Pedido
            </h2>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="text-red-800 dark:text-red-200 font-medium mb-2">
                Mensagem de Erro:
              </div>
              <div className="text-red-700 dark:text-red-300 text-sm font-mono break-all">
                {error}
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong>Como investigar este problema:</strong>
              </div>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  Abra o Console do navegador (F12) para ver os logs de debug
                </li>
                <li>Verifique se o ID do pedido na URL está correto</li>
                <li>
                  Confirme se você tem permissão para visualizar este pedido
                </li>
                <li>
                  Se você é admin, verifique se está cadastrado na tabela
                  'admins'
                </li>
              </ol>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => navigate("/orders")}>
                Voltar para Pedidos
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          Pedido não encontrado
        </div>
        <Button onClick={() => navigate("/orders")}>Voltar para Pedidos</Button>
      </div>
    );
  }
  return (
    <div className="min-h-screen dark:bg-gray-900">
      {/* HEADER COM BOTAO VOLTAR */}
      {/*  <PageMeta
        title={`Pedido #${order.id.substring(0, 8)} | Marketplace`}
        description="Detalhes do pedido"
      />{" "}
      <PageBreadcrumb pageTitle={`Pedido #${order.id.substring(0, 8)}`} /> */}
      <div className="container mx-auto px-4 py-6 bg-white rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        {/* Order Summary */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  Pedido #{order.id.substring(0, 8)}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-gray-500 dark:text-gray-400">
                    Realizado em {formatDate(order.created_at)}
                  </p>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center gap-3">
                <button
                  onClick={openOrderInfoModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Informações do pedido"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.99915 10.2451C6.96564 10.2451 7.74915 11.0286 7.74915 11.9951V12.0051C7.74915 12.9716 6.96564 13.7551 5.99915 13.7551C5.03265 13.7551 4.24915 12.9716 4.24915 12.0051V11.9951C4.24915 11.0286 5.03265 10.2451 5.99915 10.2451ZM17.9991 10.2451C18.9656 10.2451 19.7491 11.0286 19.7491 11.9951V12.0051C19.7491 12.9716 18.9656 13.7551 17.9991 13.7551C17.0326 13.7551 16.2491 12.9716 16.2491 12.0051V11.9951C16.2491 11.0286 17.0326 10.2451 17.9991 10.2451ZM13.7491 11.9951C13.7491 11.0286 12.9656 10.2451 11.9991 10.2451C11.0326 10.2451 10.2491 11.0286 10.2491 11.9951V12.0051C10.2491 12.9716 11.0326 13.7551 11.9991 13.7551C12.9656 13.7551 13.7491 12.9716 13.7491 12.0051V11.9951Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="w-full mb-6">
          <OrderProgress
            currentStep={getCurrentProgressStep()}
            paymentStatus={
              order.payment_status as
                | "pending"
                | "processing"
                | "paid"
                | "failed"
            }
            orderStatus={
              order.status as
                | "pending"
                | "processing"
                | "completed"
                | "cancelled"
            }
            hasArticleDocument={hasAnyArticleDocument}
            articleUrl={hasAnyArticleUrl ? "exists" : undefined}
          />
        </div>

        {/* Order Items */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                Itens do Pedido
              </h3>{" "}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {" "}
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
                      </th>{" "}
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
                    {" "}
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
                            console.log("🔍 Debug - Item completo:", item);
                            console.log(
                              "🔍 Debug - service_content raw:",
                              item.service_content
                            );
                            console.log(
                              "🔍 Debug - service_content type:",
                              typeof item.service_content
                            );

                            // Se não há service_content, exibir fallback simples
                            if (!item.service_content) {
                              console.log(
                                "🔍 Debug - Sem service_content, usando fallback"
                              );
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
                                console.log(
                                  "🔍 Debug - JSON string do array:",
                                  jsonString
                                );

                                if (typeof jsonString === "string") {
                                  serviceData = JSON.parse(jsonString);
                                  console.log(
                                    "🔍 Debug - Dados parseados do array:",
                                    serviceData
                                  );
                                } else if (typeof jsonString === "object") {
                                  serviceData = jsonString;
                                  console.log(
                                    "🔍 Debug - Objeto direto do array:",
                                    serviceData
                                  );
                                }
                              }
                              // Fallback para outros formatos
                              else if (
                                typeof item.service_content === "string"
                              ) {
                                serviceData = JSON.parse(item.service_content);
                                console.log(
                                  "🔍 Debug - service_content parseado de string:",
                                  serviceData
                                );
                              } else if (
                                typeof item.service_content === "object"
                              ) {
                                serviceData = item.service_content;
                                console.log(
                                  "🔍 Debug - service_content é objeto direto:",
                                  serviceData
                                );
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
                            } // Se for apenas as opções de "nenhum", não tornar clicável
                            if (
                              serviceData?.title ===
                                SERVICE_OPTIONS.LEGACY_NONE ||
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
                                onClick={() => openPackageModal(serviceData)}
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
                                handleDownloadFile(
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
                              onClick={() => openDocModal(item.id)}
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
                          )}{" "}
                        </td>{" "}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {isAdmin ? (
                            <div className="flex items-center gap-2">
                              {item.article_url ? (
                                <div className="flex items-center gap-2">
                                  {" "}
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
                                      openUrlEditModal(
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
                                  onClick={() => openUrlEditModal(item.id, "")}
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
                          )}{" "}
                        </td>
                        {isAdmin && (
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                            <Select
                              options={[
                                { value: "pending", label: "Pendente" },
                                { value: "approved", label: "Aprovar" },
                                { value: "rejected", label: "Reprovar" }
                              ]}
                              value={item.publication_status || "pending"}
                              onChange={(value) =>
                                handleChangePublicationStatus(item.id, value)
                              }
                            />
                          </td>
                        )}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}{" "}
                  </tbody>{" "}
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {" "}
                      <td
                        colSpan={isAdmin ? 7 : 6}
                        className="px-4 py-4 text-right font-medium text-gray-700 dark:text-gray-300"
                      >
                        Total:
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-800 dark:text-white font-semibold">
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>{" "}
        </div>
        {/* Anteriormente era exibido o Order Details Sidebar aqui - agora será apenas no modal */}
      </div>
      {/* Download Error Notification */}
      {downloadError && (
        <div className="fixed top-4 right-4 z-50 bg-error-500 text-white p-4 rounded-lg shadow-lg flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>{downloadError}</span>
          <button
            onClick={clearDownloadError}
            className="ml-2 text-white hover:text-gray-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {/* Document Upload Modal */}{" "}
      <Modal
        isOpen={isDocModalOpen}
        onClose={closeDocModal}
        className="max-w-md m-4"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Enviar Artigo em DOCX
          </h3>{" "}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Especificações do artigo:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                Texto com no máximo 1000 palavras
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                Incluir 2 links para 2 palavras chaves
              </li>
            </ul>
          </div>
          <div className="mb-6 flex flex-col items-center justify-center">
            <div
              onClick={handleUploadClick}
              className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 transition-colors"
            >
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Clique para selecionar ou arraste um arquivo
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Formatos aceitos: .doc, .docx
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-brand-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {selectedFile.name}
                  </span>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 p-3 bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 rounded-lg w-full text-sm">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-4 p-3 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 rounded-lg w-full text-sm">
                Arquivo enviado com sucesso!
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={closeDocModal}
              disabled={uploadLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploadLoading}
            >
              {uploadLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white\"
                    xmlns="http://www.w3.org/2000/svg\"
                    fill="none\"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25\"
                      cx="12\"
                      cy="12\"
                      r="10\"
                      stroke="currentColor\"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                "Enviar"
              )}
            </Button>{" "}
          </div>
        </div>{" "}
      </Modal>
      {/* URL Edit Modal */}
      <Modal
        isOpen={isUrlEditModalOpen}
        onClose={closeUrlEditModal}
        className="max-w-md m-4"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Editar URL do Artigo
          </h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL do Artigo Publicado
            </label>
            <input
              type="url"
              value={editingArticleUrl}
              onChange={(e) => setEditingArticleUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:focus:ring-brand-400 dark:focus:border-brand-400 outline-none"
              placeholder="https://exemplo.com/artigo"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeUrlEditModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveArticleUrl}
              disabled={!editingArticleUrl.trim()}
            >
              Salvar
            </Button>
          </div>{" "}
        </div>
      </Modal>
      {/* Package Details Modal */}
      <Modal
        isOpen={isPackageModalOpen}
        onClose={closePackageModal}
        className="max-w-md m-4"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {selectedPackageData && (
            <>
              {/* Título do Pacote */}
              <span className="mb-3 block text-xl font-semibold text-gray-800 dark:text-white/90">
                {selectedPackageData.title}
              </span>{" "}
              {/* Preço */}
              <div className="mb-1">
                <div className="flex items-end">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {selectedPackageData.is_free
                      ? "R$ 0,00"
                      : `R$ ${
                          selectedPackageData.price
                            ?.toFixed(2)
                            .replace(".", ",") || "0,00"
                        }`}
                  </h2>
                  {selectedPackageData.price_per_word &&
                    !selectedPackageData.is_free && (
                      <span className="mb-1 inline-block text-sm text-gray-500 dark:text-gray-400 ml-1">
                        /por palavra
                      </span>
                    )}
                </div>
              </div>
              {/* Informações extras */}
              {selectedPackageData.word_count && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {selectedPackageData.word_count} palavras
                </p>
              )}
              <div className="my-6 h-px w-full bg-gray-200 dark:bg-gray-800"></div>
              {/* Benefícios */}
              {selectedPackageData.benefits &&
                selectedPackageData.benefits.length > 0 && (
                  <div className="mb-8 space-y-3">
                    {selectedPackageData.benefits.map(
                      (benefit: string, index: number) => (
                        <p
                          key={index}
                          className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.4017 4.35986L6.12166 11.6399L2.59833 8.11657"
                              stroke="#12B76A"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {benefit}
                        </p>
                      )
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </Modal>
      {/* Order Information Modal */}{" "}
      {order && (
        <OrderInfoModal
          isOpen={isOrderInfoModalOpen}
          onClose={closeOrderInfoModal}
          order={order}
          getPaymentMethodLabel={getPaymentMethodLabel}
          getPaymentStatusBadge={getPaymentStatusBadge}
          confirmingBoleto={confirmingBoleto}
          handleConfirmBoletoPayment={handleConfirmBoletoPayment}
          openConfirmDeleteModal={openConfirmDeleteModal}
          isDeletingOrder={isDeletingOrder}
          deleteError={deleteError}
          isConfirmDeleteModalOpen={isConfirmDeleteModalOpen}
          closeConfirmDeleteModal={closeConfirmDeleteModal}
          deleteOrder={deleteOrder}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
