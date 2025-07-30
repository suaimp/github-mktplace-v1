import { useState, useCallback, useEffect } from 'react';
import { useCachedPagination } from './useCachedPagination';
import { CacheConfig } from './types';

interface UseCachedPaginationWithItemsPerPageParams<T> {
  fetchFunction: (params: any) => Promise<{
    data: T[];
    pagination: {
      totalPages: number;
      totalItems: number;
    };
  }>;
  dependencies: any[];
  cacheConfig?: CacheConfig;
  initialPage?: number;
  initialItemsPerPage?: number;
}

export function useCachedPaginationWithItemsPerPage<T>({
  fetchFunction,
  dependencies,
  cacheConfig,
  initialItemsPerPage = 10
}: UseCachedPaginationWithItemsPerPageParams<T>) {
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Usar o hook de paginação existente
  const paginationResult = useCachedPagination({
    fetchFunction,
    dependencies: [...dependencies, itemsPerPage], // Adicionar itemsPerPage às dependencies
    cacheConfig
  });

  // Handler para mudança de itens por página
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    // Reset para primeira página quando mudar items per page
    paginationResult.setCurrentPage(1);
  }, [paginationResult]);

  // Sincronizar itemsPerPage com o hook de paginação
  useEffect(() => {
    paginationResult.setItemsPerPage(itemsPerPage);
  }, [itemsPerPage, paginationResult]);

  return {
    ...paginationResult,
    itemsPerPage,
    setItemsPerPage,
    handleItemsPerPageChange
  };
}
