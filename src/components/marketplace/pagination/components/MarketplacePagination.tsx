import React from 'react';
import { MarketplacePaginationProps } from '../types';
import { MarketplaceItemsPerPageSelector } from './MarketplaceItemsPerPageSelector';

export const MarketplacePagination: React.FC<MarketplacePaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPreviousPage,
  onNextPage,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      {/* Navegação da paginação com seletor de itens por página */}
      {totalPages > 1 ? (
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 max-[500px]:flex-col max-[500px]:items-center">
            <div className="flex items-center gap-6 max-[500px]:w-full max-[500px]:justify-center">
              {/* Seletor de itens por página */}
              <MarketplaceItemsPerPageSelector
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
              />
              {/* Informações de resultados */}
              <p className="hidden md:block text-[13px] text-gray-700 dark:text-gray-300">
                Mostrando {startIndex + 1} a{" "}
                {endIndex} de{" "}
                {totalItems} resultados
              </p>
            </div>
            <div className="flex items-center space-x-2 max-[500px]:w-full max-[500px]:justify-center">
              <button
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Página anterior"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Próxima página"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Quando há apenas uma página, mostrar só o seletor e informações */
        <div className="px-4 py-3">
          <div className="flex items-center gap-6 max-[500px]:justify-center">
            {/* Seletor de itens por página */}
            <MarketplaceItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
            />
            {/* Informações de resultados */}
            <p className="hidden md:block text-[13px] text-gray-700 dark:text-gray-300">
              Mostrando {startIndex + 1} a{" "}
              {endIndex} de{" "}
              {totalItems} resultados
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
