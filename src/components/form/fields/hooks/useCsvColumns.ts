import { useState } from "react";
import { CsvData } from "../types/csvTypes";

export function useCsvColumns() {
  const [csvData, setCsvData] = useState<CsvData>({ headers: [], rows: [] });
  const [error, setError] = useState<string | null>(null);

  const parseCsvColumns = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length === 0) {
        setError("Arquivo CSV vazio.");
        return;
      }

      // Primeira linha são os cabeçalhos
      const headers = lines[0].split(/[,;]/).map(col => col.trim()).filter(Boolean);
      
      if (headers.length === 0) {
        setError("Não foi possível detectar colunas no CSV.");
        return;
      }

      // Demais linhas são os dados
      const rows = lines.slice(1).map(line => 
        line.split(/[,;]/).map(cell => cell.trim())
      );

      setCsvData({ headers, rows });
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo CSV.");
    };
    reader.readAsText(file);
  };

  return { csvData, error, parseCsvColumns };
}
