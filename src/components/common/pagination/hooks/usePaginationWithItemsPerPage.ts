import { useState, useCallback } from 'react';

export interface UsePaginationWithItemsPerPageProps {
  initialPage?: number;
  initialItemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export interface UsePaginationWithItemsPerPageReturn {
  currentPage: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (newItemsPerPage: number) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  resetToFirstPage: () => void;
}

export const usePaginationWithItemsPerPage = ({
  initialPage = 1,
  initialItemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: UsePaginationWithItemsPerPageProps = {}): UsePaginationWithItemsPerPageReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    onItemsPerPageChange?.(newItemsPerPage);
  }, [onItemsPerPageChange]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    onPageChange?.(1);
  }, [onPageChange]);

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    setCurrentPage,
    setItemsPerPage,
    resetToFirstPage
  };
};
