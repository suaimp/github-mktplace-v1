import { useState, useEffect, useCallback } from 'react';

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
 * Implementa busca em tempo real com debounce
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

  // Implementar busca em tempo real com debounce de 300ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchTerm) {
        onSearchChange(searchInput);
        onPageReset();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchTerm, onSearchChange, onPageReset]);

  // Dispara busca imediatamente (para quando clica na lupa ou pressiona Enter)
  const handleSearchSubmit = useCallback(() => {
    if (searchInput !== searchTerm) {
      onSearchChange(searchInput);
      onPageReset();
    }
  }, [searchInput, searchTerm, onSearchChange, onPageReset]);

  return {
    searchInput,
    setSearchInput,
    handleSearchSubmit,
  };
}
