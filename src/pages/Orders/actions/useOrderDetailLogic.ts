import { useState, useRef } from "react";

import { supabase } from "../../../lib/supabase";
import { useOrderDetails } from "./useOrderDetails";
import { useFileDownload } from "./useFileDownload";

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

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          order_id,
          orders!inner(
            id,
            user_id
          )
        `
        )
        .eq("id", selectedItemId)
        .single();

      if (itemError) {
        throw itemError;
      } else {
        itemData;
      }

      const { error: updateError } = await supabase
        .from("order_items")
        .update({
          article_document_path: filePath,
          article_doc: selectedFile.name
        })
        .eq("id", selectedItemId);

      if (updateError) {
        throw updateError;
      }

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
    clearDownloadError
  };
}
