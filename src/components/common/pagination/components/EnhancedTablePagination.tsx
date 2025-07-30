import React from 'react';
import { EnhancedTablePaginationProps } from '../types';
import { TablePagination } from '../TablePagination';
import { ItemsPerPageSelector } from './ItemsPerPageSelector';

export const EnhancedTablePagination: React.FC<EnhancedTablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showInfo = true,
  itemLabel = "registros",
  showItemsPerPageSelector = true,
  itemsPerPageOptions = [10, 25, 50, 100]
}) => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Seletor de itens por página */}
      {showItemsPerPageSelector && onItemsPerPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            itemLabel={itemLabel}
            options={itemsPerPageOptions}
          />
        </div>
      )}
      
      {/* Paginação tradicional */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          showInfo={showInfo}
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
};
