import { useState } from 'react';

/**
 * Hook para paginação local de arrays
 * @param items Array de qualquer tipo
 * @param pageSize Quantidade de itens por página
 */
export function useLocalPagination<T>(items: T[], pageSize: number = 15) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice(page * pageSize, (page + 1) * pageSize);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setPage((p) => Math.max(p - 1, 0));
  const goToPage = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));

  return {
    page,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    hasNext: page < totalPages - 1,
    hasPrev: page > 0,
    setPage
  };
}
