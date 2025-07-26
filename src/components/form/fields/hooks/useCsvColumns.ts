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

      // Função para fazer parse de uma linha CSV considerando valores com vírgulas decimais
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
          const char = line[i];
          
          if (char === '"' && (i === 0 || line[i-1] === ',' || line[i-1] === ';')) {
            // Início de campo entre aspas
            inQuotes = true;
          } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',' || line[i+1] === ';')) {
            // Fim de campo entre aspas
            inQuotes = false;
          } else if ((char === ',' || char === ';') && !inQuotes) {
            // Separador de campo
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
          i++;
        }
        
        // Adiciona o último campo
        result.push(current.trim());
        
        return result.filter(Boolean);
      };

      // Primeira linha são os cabeçalhos
      const headers = parseCsvLine(lines[0]);
      
      if (headers.length === 0) {
        setError("Não foi possível detectar colunas no CSV.");
        return;
      }

      // Demais linhas são os dados
      const rows = lines.slice(1).map(line => parseCsvLine(line));

      console.log("🔍 [useCsvColumns] Headers:", headers);
      console.log("🔍 [useCsvColumns] First row parsed:", rows[0]);

      setCsvData({ headers, rows });
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo CSV.");
    };
    reader.readAsText(file);
  };

  return { csvData, error, parseCsvColumns };
}
