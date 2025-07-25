import { useState } from "react";
import { CsvImportService } from "../services/csvImportService";
import { FormField, CsvImportData } from "../types/csvImportTypes";

export function useCsvImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importCsvData = async (csvData: CsvImportData, formFields: FormField[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await CsvImportService.importCsvData(csvData, formFields);
      
      if (!result.success) {
        setError(result.error || "Erro desconhecido");
        return null;
      }

      return result.entries;
    } catch (err: any) {
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
