import React from "react";
import Button from "../../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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

interface OrderInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  getPaymentMethodLabel: (method: string) => string;
  getPaymentStatusBadge: (status: string) => React.ReactElement;
  confirmingBoleto: boolean;
  handleConfirmBoletoPayment: () => void;
  openConfirmDeleteModal: (orderId: string) => void;
  isDeletingOrder: boolean;
  deleteError: string | null;
  // Confirmation modal props
  isConfirmDeleteModalOpen: boolean;
  closeConfirmDeleteModal: () => void;
  deleteOrder: () => void;
  // Admin permission
  isAdmin: boolean;
}

export default function OrderInfoModal({
  isOpen,
  onClose,
  order,
  getPaymentMethodLabel,
  getPaymentStatusBadge,
  confirmingBoleto,
  handleConfirmBoletoPayment,
  openConfirmDeleteModal,
  isDeletingOrder,
  deleteError,
  isConfirmDeleteModalOpen,
  closeConfirmDeleteModal,
  deleteOrder,
  isAdmin,
}: OrderInfoModalProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-[999999] transition-all duration-300 ${
          isOpen ? "bg-opacity-50 visible" : "bg-opacity-0 invisible"
        }`}
        onClick={onClose}
      />
      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[999999] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Informações do Pedido
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
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
                <div className="text-gray-800 dark:text-white">
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
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
              {/* Botão de confirmação de boleto para admins */}
              {order.payment_method === "boleto" &&
                order.payment_status === "pending" &&
                isAdmin && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          Aguardando Confirmação de Pagamento
                        </h4>
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">
                          Boleto aguardando confirmação bancária
                        </p>
                      </div>
                      <Button
                        onClick={handleConfirmBoletoPayment}
                        disabled={confirmingBoleto}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {confirmingBoleto ? (
                          <div className="flex items-center">
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
                            Confirmando...
                          </div>
                        ) : (
                          "Confirmar Pagamento"
                        )}
                      </Button>
                    </div>
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
                </div>{" "}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Documento
                  </h4>
                  <p className="text-gray-800 dark:text-white">
                    {order.billing_document_number}
                  </p>{" "}
                </div>
                {/* Delete Order Section - Only for Admins */}
                {isAdmin && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      Ações Administrativas
                    </h4>
                    {/* Error Message */}
                    {deleteError && (
                      <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-red-800 dark:text-red-200 text-sm">
                          {deleteError}
                        </div>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => openConfirmDeleteModal(order.id)}
                      disabled={isDeletingOrder}
                      className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      {isDeletingOrder ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600"
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
                          Excluindo Pedido...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>{" "}
                          Excluir Pedido
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>{" "}
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/orders")}
                className="flex-1"
              >
                Voltar para Pedidos
              </Button>

              <Button onClick={onClose} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>{" "}
        </div>
      </div>
      {/* Delete Confirmation Modal */}{" "}
      <DeleteConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={closeConfirmDeleteModal}
        onConfirm={deleteOrder}
        title="Confirmar Exclusão do Pedido"
        message={`Tem certeza que deseja excluir o pedido #${order.id.substring(
          0,
          8
        )}? Esta ação não pode ser desfeita e removerá permanentemente o pedido e todos os seus itens do sistema.`}
        confirmationText="excluir pedido"
        isDeleting={isDeletingOrder}
        deleteError={deleteError}
      />
    </>
  );
}
