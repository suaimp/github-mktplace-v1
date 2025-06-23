import { useState, useRef } from "react";

import { supabase } from "../../../lib/supabase";
import { useOrderDetails } from "./useOrderDetails";
import { useFileDownload } from "./useFileDownload";
import { simulateBoletoPaymentConfirmation } from "../../../context/db-context/services/OrderService";
import { OrderItemService } from "../../../context/db-context/services/OrderItemService";

export function useOrderDetailLogic() {
  const {
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
    openDocModal,
    closeDocModal,
    handleFileUpload,
    formatDate,
    getStatusBadge,
    getPaymentStatusBadge,
    getPaymentMethodLabel
  } = useOrderDetails();

  const {
    downloadLoading,
    downloadError,
    handleDownloadFile,
    clearDownloadError
  } = useFileDownload();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [confirmingBoleto, setConfirmingBoleto] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedItemId) {
      setUploadError("Por favor, selecione um arquivo para enviar.");
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);
      setUploadSuccess(false);

      if (
        !selectedFile.name.endsWith(".doc") &&
        !selectedFile.name.endsWith(".docx")
      ) {
        setUploadError("Apenas arquivos .doc ou .docx são permitidos.");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError("O arquivo não pode ser maior que 10MB.");
        return;
      }

      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${selectedItemId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error: uploadError } = await supabase.storage
        .from("article_documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Busca o item do pedido junto com o pedido relacionado
      await OrderItemService.getOrderItemWithOrder(selectedItemId);

      // Atualiza o registro do item do pedido com o caminho do documento e nome do arquivo
      await OrderItemService.uploadArticleDocument(
        selectedItemId,
        filePath,
        selectedFile.name
      );

      setUploadSuccess(true);
      await handleFileUpload(selectedFile);
      setTimeout(() => {
        closeDocModal();
        setSelectedFile(null);
        setUploadSuccess(false);
      }, 2000);
    } catch (error: any) {
      setUploadError(
        error.message || "Erro ao enviar o arquivo. Tente novamente."
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleConfirmBoletoPayment = async () => {
    if (!order) return;

    try {
      setConfirmingBoleto(true);
      console.log("🏦 Confirmando pagamento de boleto para pedido:", order.id);

      const success = await simulateBoletoPaymentConfirmation(order.id);

      if (success) {
        console.log("✅ Pagamento confirmado com sucesso");
        // Atualizar o estado local do pedido
        window.location.reload(); // Simples reload para atualizar os dados
      } else {
        console.error("❌ Falha ao confirmar pagamento");
      }
    } catch (error) {
      console.error("❌ Erro ao confirmar pagamento:", error);
    } finally {
      setConfirmingBoleto(false);
    }
  };

  // Função para envio da URL do artigo
  const sendArticleUrl = async (itemId: string, url: string) => {
    try {
      await OrderItemService.updateOrderItem(itemId, { article_url: url });
      console.log("URL do artigo salva com sucesso:", { itemId, url });
    } catch (error) {
      console.error("Erro ao salvar URL do artigo:", error);
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
    openDocModal,
    closeDocModal,
    handleFileUpload,
    formatDate,
    getStatusBadge,
    getPaymentStatusBadge,
    getPaymentMethodLabel,
    fileInputRef,
    selectedFile,
    setSelectedFile,
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
    sendArticleUrl
  };
}
