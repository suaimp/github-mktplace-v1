import React from 'react';
import { PaginationControlsProps } from '../types';

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate window of pages to show (5 numbers max)
  const getPageWindow = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageWindow = getPageWindow();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center space-x-2">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Anterior
      </button>
      
      <div className="flex items-center space-x-1">
        {/* Page numbers */}
        {pageWindow.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? "bg-brand-500 text-white border border-brand-500"
                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      
      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Próxima
      </button>
    </div>
  );
};
