import React from 'react';
import { PaginationProps } from '../types';
import { PaginationInfo } from './PaginationInfo.tsx';
import { PaginationControls } from './PaginationControls';
import { ItemsPerPageSelector } from '../../../common/pagination';

export interface ExtendedPaginationProps extends PaginationProps {
  onItemsPerPageChange?: (value: number) => void;
}

export const Pagination: React.FC<ExtendedPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showInfo = true,
  itemLabel = "registros"
}) => {
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6 gap-3">
      <div className="flex items-center gap-4">
        {/* Seletor de itens por página na primeira posição */}
        {onItemsPerPageChange && (
          <ItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            itemLabel={itemLabel}
          />
        )}
        
        {/* Informações de paginação */}
        {showInfo && (
          <PaginationInfo
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            itemLabel={itemLabel}
          />
        )}
      </div>
      
      {/* Controles de paginação */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
