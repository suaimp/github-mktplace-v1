import { useState } from "react";
import { ArticleDocumentsService } from "../../../context/buckets-services/articleDocumentsService";

interface UseFileDownloadReturn {
  downloadLoading: { [itemId: string]: boolean };
  downloadError: string | null;
  handleDownloadFile: (
    filePath: string,
    fileName: string,
    itemId: string
  ) => Promise<void>;
  clearDownloadError: () => void;
}

export function useFileDownload(): UseFileDownloadReturn {
  const [downloadLoading, setDownloadLoading] = useState<{
    [itemId: string]: boolean;
  }>({});
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadFile = async (
    filePath: string,
    fileName: string,
    itemId: string
  ) => {
    try {
      setDownloadLoading((prev) => ({ ...prev, [itemId]: true }));
      setDownloadError(null);

      // Verificar se o arquivo existe
      const fileExists = await ArticleDocumentsService.fileExists(filePath);
      if (!fileExists) {
        throw new Error("Arquivo não encontrado");
      }

      // Baixar o arquivo usando o serviço
      const { data, error } = await ArticleDocumentsService.downloadFile(
        filePath
      );

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Erro ao baixar o arquivo");
      }

      // Criar URL temporária para download
      const url = URL.createObjectURL(data);

      // Criar elemento <a> temporário para download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || filePath.split("/").pop() || "documento";
      document.body.appendChild(link);

      // Simular clique no link para iniciar o download
      link.click();

      // Limpar recursos
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Erro ao baixar arquivo:", error);
      setDownloadError(error.message || "Erro ao baixar o arquivo");
    } finally {
      setDownloadLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const clearDownloadError = () => {
    setDownloadError(null);
  };

  return {
    downloadLoading,
    downloadError,
    handleDownloadFile,
    clearDownloadError
  };
}
