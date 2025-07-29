import React from 'react';
import { PaginationProps } from '../types';
import { PaginationInfo } from './PaginationInfo.tsx';
import { PaginationControls } from './PaginationControls';

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  itemLabel = "registros"
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6">
      {showInfo && (
        <PaginationInfo
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          itemLabel={itemLabel}
        />
      )}
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
