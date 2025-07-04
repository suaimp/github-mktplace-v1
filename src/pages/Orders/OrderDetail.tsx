import { useOrderDetailLogic } from "./actions/useOrderDetailLogic";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useState, useEffect } from "react";
import OrderProgress from "./local-components/OrderProgress";
import OrderItemsTable from "./local-components/OrderItemsTable";
import { supabase } from "../../lib/supabase";
import OrderInfoModal from "./local-components/OrderInfoModal";
import { useOrderInfoModal } from "./actions/useOrderInfoModal";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";

export default function OrderDetail() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTableTrigger, setRefreshTableTrigger] = useState(0);
  const [refreshProgressTrigger, setRefreshProgressTrigger] = useState(0);

  // Estado para o modal de edição de URL do artigo
  const [isPublishedUrlModalOpen, setIsPublishedUrlModalOpen] = useState(false);
  const [selectedItemForPublishedUrl, setSelectedItemForPublishedUrl] =
    useState<string>("");
  const [editingPublishedArticleUrl, setEditingPublishedArticleUrl] =
    useState("");
  // Estado para o modal de informações do pacote
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState<any>(null);
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
    sendArticleUrl,
    getPaymentMethodLabel,
    getPaymentStatusBadge,
    confirmingBoleto,
    handleConfirmBoletoPayment,
    selectedItemId,
  } = useOrderDetailLogic();

  const [isOrderInfoOpen, setIsOrderInfoOpen] = useState(false);

  const {
    isConfirmDeleteModalOpen,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
    deleteOrder,
    isDeletingOrder,
    deleteError,
  } = useOrderInfoModal();

  // Estado para tipo de envio do artigo
  const [articleSendType, setArticleSendType] = useState<string>("upload");
  const [articleUrlInput, setArticleUrlInput] = useState("");
  const [articleUrlError, setArticleUrlError] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { user },
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
  const openPublishedUrlModal = (itemId: string, currentUrl: string = "") => {
    setSelectedItemForPublishedUrl(itemId);
    setEditingPublishedArticleUrl(currentUrl);
    setIsPublishedUrlModalOpen(true);
  };
  const closePublishedUrlModal = () => {
    setIsPublishedUrlModalOpen(false);
    setSelectedItemForPublishedUrl("");
    setEditingPublishedArticleUrl("");
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

  // Função para disparar refresh da tabela
  const triggerTableRefresh = () => {
    setRefreshTableTrigger((prev) => prev + 1);
  };

  // Função para disparar refresh da barra de status
  const triggerProgressRefresh = () => {
    setRefreshProgressTrigger((prev) => prev + 1);
  };

  const handleSavePublishedArticleUrl = async () => {
    if (!selectedItemForPublishedUrl) return;
    try {
      await sendArticleUrl(
        selectedItemForPublishedUrl,
        editingPublishedArticleUrl,
        'article_url'
      );
      closePublishedUrlModal();
      triggerTableRefresh();
      triggerProgressRefresh();
    } catch (error) {
      console.error("Erro ao salvar URL do artigo publicado:", error);
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

  // Função para envio do link para o banco (como string array)
  const handleSendArticleUrl = async () => {
    if (!articleUrlInput.trim()) {
      setArticleUrlError("Informe a URL do Google Docs.");
      return;
    }
    setArticleUrlError(null);
    try {
      // Envia para a coluna article_url e atualiza o status
      await sendArticleUrl(
        selectedItemId!,
        articleUrlInput.trim()
      );
      closeDocModal();
      setArticleUrlInput("");
      setArticleSendType("upload");
      triggerTableRefresh();
      triggerProgressRefresh();
    } catch (error) {
      setArticleUrlError("Erro ao enviar URL. Tente novamente.");
    }
  };

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
              </Button>{" "}
              <Button
                variant="outline"
                onClick={() => (window.location.href = window.location.href)}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 relative">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  ID do Pedido: {order.id.substring(0, 8)}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-gray-500 dark:text-gray-400">
                    Realizado em {formatDate(order.created_at)}
                  </p>
                </div>{" "}
              </div>
              {/* Ícone de três pontinhos no canto direito */}
              <button
                className="absolute top-0 right-0 mt-2 mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                onClick={() => setIsOrderInfoOpen(true)}
                title="Mais informações"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-300"
                >
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
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
            orderDate={order.created_at}
            orderItems={orderItems}
            refreshTrigger={refreshProgressTrigger}
            orderId={order.id}
          />
        </div>
        {/* Order Items */}
        <div className="w-full">
          {" "}
          <OrderItemsTable
            orderId={order.id}
            isAdmin={isAdmin}
            onPackageModalOpen={openPackageModal}
            onDocModalOpen={openDocModal}
            onUrlEditModalOpen={openPublishedUrlModal}
            onDownloadFile={handleDownloadFile}
            onChangePublicationStatus={async (itemId, status) => {
              await handleChangePublicationStatus(itemId, status);
              triggerTableRefresh();
            }}
            downloadLoading={downloadLoading}
            refreshTrigger={refreshTableTrigger}
          />
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
        onClose={() => {
          closeDocModal();
          setArticleSendType("upload");
          setArticleUrlInput("");
          setArticleUrlError(null);
        }}
        className="max-w-md m-4"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Enviar Artigo em DOCX
          </h3>
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
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                Incluir 1 imagem de destaque com fonte
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <p>Veja o exemplo: </p>
              <a
                href="https://docs.google.com/document/d/1t9I9VkMCWEiNNsDsoJVvmwi8kf1Nk5iR8rfFMlNVp8A/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-sm"
              >
                Abrir Link de exemplo
              </a>
            </div>
          </div>
          {/* Select de tipo de envio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Como deseja enviar o Artigo?
            </label>
            <Select
              options={[
                { value: "upload", label: "Upload de arquivo" },
                { value: "link", label: "Link Google Docs" },
              ]}
              value={articleSendType}
              onChange={setArticleSendType}
              placeholder="Selecione uma opção"
            />
          </div>
          {/* Renderização condicional */}
          {articleSendType === "upload" ? (
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
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link do Google Docs
              </label>
              <Input
                type="url"
                value={articleUrlInput}
                onChange={(e) => setArticleUrlInput(e.target.value)}
                placeholder="Cole aqui o link do Google Docs"
                required
                className={articleUrlError ? "border-error-500" : ""}
              />
              {articleUrlError && (
                <div className="mt-2 text-error-500 text-xs">
                  {articleUrlError}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                closeDocModal();
                setArticleSendType("upload");
                setArticleUrlInput("");
                setArticleUrlError(null);
              }}
              disabled={uploadLoading}
            >
              Cancelar
            </Button>
            {articleSendType === "upload" ? (
              <Button
                onClick={() => {
                  triggerProgressRefresh();
                  handleUploadSubmit();
                }}
                disabled={!selectedFile || uploadLoading}
              >
                {uploadLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    Enviando...
                  </span>
                ) : (
                  "Enviar"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSendArticleUrl}
                disabled={!articleUrlInput.trim()}
              >
                Enviar
              </Button>
            )}
          </div>
        </div>
      </Modal>
      {/* URL Edit Modal */}
      <Modal
        isOpen={isPublishedUrlModalOpen}
        onClose={closePublishedUrlModal}
        className="max-w-md m-4"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Editar URL do Artigo Publicado
          </h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL do Artigo Publicado
            </label>
            <input
              type="url"
              value={editingPublishedArticleUrl}
              onChange={(e) => setEditingPublishedArticleUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:focus:ring-brand-400 dark:focus:border-brand-400 outline-none"
              placeholder="https://exemplo.com/artigo"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closePublishedUrlModal}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                triggerProgressRefresh();
                handleSavePublishedArticleUrl();
              }}
              disabled={!editingPublishedArticleUrl.trim()}
            >
              Salvar
            </Button>
          </div>
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
      </Modal>{" "}
      {/* OrderInfoModal */}
      <OrderInfoModal
        isOpen={isOrderInfoOpen}
        onClose={() => setIsOrderInfoOpen(false)}
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
    </div>
  );
}
