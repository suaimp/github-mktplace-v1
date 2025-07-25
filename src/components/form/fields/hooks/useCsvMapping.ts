import { CsvData, CsvMappingResult } from "../types/csvTypes";

export function useCsvMapping() {
  const mapCsvData = (csvData: CsvData, mapping: Record<string, string>): CsvMappingResult => {
    const result: CsvMappingResult = {
      url: [],
      da: [],
      preco: []
    };

    // Para cada campo mapeado
    Object.entries(mapping).forEach(([fieldKey, columnHeader]) => {
      if (!columnHeader) return; // Skip se não mapeado

      // Encontra o índice da coluna pelos cabeçalhos
      const columnIndex = csvData.headers.indexOf(columnHeader);
      if (columnIndex === -1) return; // Skip se coluna não encontrada

      // Extrai os valores dessa coluna de todas as linhas
      const columnValues = csvData.rows.map(row => row[columnIndex] || "");
      
      // Adiciona ao resultado
      if (fieldKey in result) {
        (result as any)[fieldKey] = columnValues;
      }
    });

    return result;
  };

  return { mapCsvData };
}
