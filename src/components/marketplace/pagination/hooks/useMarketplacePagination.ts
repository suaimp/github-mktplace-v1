import { useState, useEffect, useCallback } from 'react';

export interface UseMarketplacePaginationProps {
  totalItems: number;
  initialItemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export interface MarketplacePaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export interface UseMarketplacePaginationReturn extends MarketplacePaginationState {
  setCurrentPage: (page: number) => void;
  handleItemsPerPageChange: (itemsPerPage: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const useMarketplacePagination = ({
  totalItems,
  initialItemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: UseMarketplacePaginationProps): UseMarketplacePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate derived values
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Handler for items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    onItemsPerPageChange?.(newItemsPerPage);
  }, [onItemsPerPageChange]);

  // Handler for page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  // Ensure current page is valid when total items change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginationState: MarketplacePaginationState = {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex
  };

  return {
    ...paginationState,
    setCurrentPage: handlePageChange,
    handleItemsPerPageChange,
    goToFirstPage: () => handlePageChange(1),
    goToLastPage: () => handlePageChange(totalPages),
    goToNextPage: () => handlePageChange(Math.min(currentPage + 1, totalPages)),
    goToPreviousPage: () => handlePageChange(Math.max(currentPage - 1, 1))
  };
};
