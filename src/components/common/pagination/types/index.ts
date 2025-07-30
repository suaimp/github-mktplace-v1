export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  itemLabel?: string;
}

export interface ItemsPerPageSelectorProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  itemLabel?: string;
  options?: number[];
  className?: string;
}

export interface EnhancedTablePaginationProps extends TablePaginationProps {
  onItemsPerPageChange?: (value: number) => void;
  showItemsPerPageSelector?: boolean;
  itemsPerPageOptions?: number[];
}
