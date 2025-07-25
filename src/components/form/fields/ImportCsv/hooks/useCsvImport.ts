import { useState } from "react";
import { CsvImportOrchestrator } from "../services";
import { CsvImportRequest, CsvImportResult } from "../types";

/**
 * Hook para gerenciar o estado da importação CSV
 */
export function useCsvImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCsvData = async (request: CsvImportRequest): Promise<string[] | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🎯 [useCsvImport] Iniciando importação com request:", request);
      
      const result: CsvImportResult = await CsvImportOrchestrator.importCsvData(request);
      
      if (!result.success) {
        setError(result.error || "Erro desconhecido");
        return null;
      }

      console.log("✅ [useCsvImport] Importação bem-sucedida!");
      return result.entries || [];
      
    } catch (err: any) {
      console.error("❌ [useCsvImport] Erro no hook:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    importCsvData,
    loading,
    error,
    clearError: () => setError(null)
  };
}
