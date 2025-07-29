import { useState, useEffect } from 'react';

interface UseTableSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageReset: () => void;
}

interface UseTableSearchReturn {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearchSubmit: () => void;
}

/**
 * Hook personalizado para gerenciar a busca na tabela
 * Separa a lógica de busca do componente principal
 */
export function useTableSearch({ 
  searchTerm, 
  onSearchChange, 
  onPageReset 
}: UseTableSearchProps): UseTableSearchReturn {
  const [searchInput, setSearchInput] = useState(searchTerm);

  // Sincronizar o input local com o searchTerm externo
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Dispara busca apenas ao clicar na lupa ou pressionar Enter
  const handleSearchSubmit = () => {
    if (searchInput !== searchTerm) {
      onSearchChange(searchInput);
      onPageReset();
    }
  };

  return {
    searchInput,
    setSearchInput,
    handleSearchSubmit,
  };
}
