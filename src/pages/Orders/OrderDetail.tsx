import { useOrderDetailLogic } from "./actions/useOrderDetailLogic";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { formatCurrency } from "../../components/marketplace/utils";
import { getFaviconUrl } from "../../components/form/utils/formatters";
import Select from "../../components/form/Select";
import Tooltip from "../../components/ui/Tooltip";
import { Modal } from "../../components/ui/modal";

export default function OrderDetail() {
  const {
    order,
    orderItems,
    loading,
    error,
    isDocModalOpen,
    articleUrl,
    navigate,
    handleChangePublicationStatus,
    handleArticleUrlChange,
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
    clearDownloadError
  } = useOrderDetailLogic();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-error-500 mb-4">{error}</div>
        <Button onClick={() => navigate("/orders")}>Voltar para Pedidos</Button>
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
    <>
      <PageMeta
        title={`Pedido #${order.id.substring(0, 8)} | Marketplace`}
        description="Detalhes do pedido"
      />
      <PageBreadcrumb pageTitle={`Pedido #${order.id.substring(0, 8)}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                  Pedido #{order.id.substring(0, 8)}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Realizado em {formatDate(order.created_at)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                <div className="mb-2">{getStatusBadge(order.status)}</div>
                <div>{getPaymentStatusBadge(order.payment_status)}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Itens do Pedido
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Artigo DOC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        URL do Artigo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status de Publicação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
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

                          {/* Display niche if available */}
                          {item.niche &&
                            Array.isArray(item.niche) &&
                            item.niche.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Nicho: {item.niche[0]?.niche || ""}
                              </div>
                            )}

                          {/* Display service content if available */}
                          {item.service_content &&
                            Array.isArray(item.service_content) &&
                            item.service_content.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Pacote: {item.service_content[0]?.title || ""}
                              </div>
                            )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
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
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <div className="flex items-center">
                            <Tooltip content="Insira a URL do artigo">
                              <input
                                type="text"
                                value={articleUrl[item.id] || ""}
                                onChange={(e) =>
                                  handleArticleUrlChange(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                                placeholder="URL do artigo"
                              />
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
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
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
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
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={6}
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
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Informações do Pedido
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Método de Pagamento
                </h4>
                <p className="text-gray-800 dark:text-white">
                  {getPaymentMethodLabel(order.payment_method)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status do Pagamento
                </h4>
                <p className="text-gray-800 dark:text-white">
                  {getPaymentStatusBadge(order.payment_status)}
                </p>
              </div>

              {order.payment_id && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    ID do Pagamento
                  </h4>
                  <p className="text-gray-800 dark:text-white font-mono text-sm">
                    {order.payment_id}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 my-4 pt-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Informações de Cobrança
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nome
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {order.billing_name}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {order.billing_email}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Endereço
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {order.billing_address}
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    {order.billing_city}, {order.billing_state}
                  </p>
                  <p className="text-gray-800 dark:text-white">
                    CEP: {order.billing_zip_code}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Documento
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {order.billing_document_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/orders")}
              >
                Voltar para Pedidos
              </Button>
            </div>
          </div>
        </div>
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

      {/* Document Upload Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={closeDocModal}
        className="max-w-md m-4"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Enviar Artigo em DOCX
          </h3>

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
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
