import React from 'react';
import { TablePaginationProps } from './types';

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  itemLabel = "registros"
}) => {
  if (totalPages <= 1) return null;

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
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 custom-750:px-6">
      {showInfo && (
        <div className="flex items-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando{" "}
            <span className="font-medium">{startItem}</span>{" "}
            a{" "}
            <span className="font-medium">{endItem}</span>{" "}
            de{" "}
            <span className="font-medium">{totalItems}</span>{" "}
            {itemLabel}
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between gap-1">
        <button 
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="text-theme-sm shadow-theme-xs flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-2 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 custom-750:px-3.5 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 9.99715C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 9.99715C2.58301 9.99766 2.58301 9.99817 2.58301 9.99868Z" fill=""></path>
          </svg>

          <span className="hidden custom-750:inline">Anterior</span>
        </button>

        <span className="block text-sm font-medium text-gray-700 custom-750:hidden dark:text-gray-400">
          Página {currentPage} de {totalPages}
        </span>

        <ul className="hidden items-center gap-0.5 custom-750:flex">
          {pageWindow.map((page) => (
            <li key={page}>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                className={`text-theme-sm flex h-10 w-10 items-center justify-center rounded-lg font-medium ${
                  page === currentPage
                    ? "bg-brand-500/[0.08] text-brand-500 hover:bg-brand-500/[0.08] hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-500"
                    : "hover:bg-brand-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500 text-gray-700 dark:text-gray-400"
                }`}
              >
                {page}
              </a>
            </li>
          ))}
        </ul>

        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="text-theme-sm shadow-theme-xs flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-2 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 custom-750:px-3.5 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <span className="hidden custom-750:inline">Próxima</span>

          <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.30L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715C17.4175 9.99763 17.4175 9.99812 17.4175 9.9986Z" fill=""></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
