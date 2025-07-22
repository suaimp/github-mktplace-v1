import { useEffect, useState } from 'react';

interface TableStateOptions {
  entriesCount?: number;
  checkInterval?: number;
}

export const useTableState = (options: TableStateOptions = {}) => {
  const { entriesCount, checkInterval = 100 } = options;
  const [tableLoaded, setTableLoaded] = useState(false);
  const [actualEntriesCount, setActualEntriesCount] = useState(0);

  useEffect(() => {
    const checkTableState = () => {
      // Verifica se a tabela existe
      const table = document.querySelector('[class*="marketplace"]');
      if (!table) return false;

      // Verifica se há linhas de dados na tabela
      const dataRows = table.querySelectorAll('tbody tr, .table-row');
      const currentCount = dataRows.length;
      
      setActualEntriesCount(currentCount);

      // Se temos um número esperado de entradas, verifica se coincide
      if (entriesCount && entriesCount > 0) {
        return currentCount >= entriesCount;
      }

      // Caso contrário, verifica se há pelo menos uma linha
      return currentCount > 0;
    };

    const intervalId = setInterval(() => {
      if (checkTableState()) {
        setTableLoaded(true);
        clearInterval(intervalId);
      }
    }, checkInterval);

    // Limpa o interval após 5 segundos mesmo se a tabela não carregar
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setTableLoaded(true); // Força como carregado para evitar loops infinitos
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [entriesCount, checkInterval]);

  return {
    tableLoaded,
    actualEntriesCount
  };
};
