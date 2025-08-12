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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            {/* Seletor de itens por página */}
            <MarketplaceItemsPerPageSelector
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
            />
            {/* Informações de resultados */}
            <p className="text-[13px] text-gray-700 dark:text-gray-300">
              Mostrando {startIndex + 1} a{" "}
              {endIndex} de{" "}
              {totalItems} resultados
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Próxima
            </button>
          </div>
        </div>
      ) : (
        /* Quando há apenas uma página, mostrar só o seletor e informações */
        <div className="flex items-center gap-6 px-4 py-3">
          {/* Seletor de itens por página */}
          <MarketplaceItemsPerPageSelector
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
          />
          {/* Informações de resultados */}
          <p className="text-[13px] text-gray-700 dark:text-gray-300">
            Mostrando {startIndex + 1} a{" "}
            {endIndex} de{" "}
            {totalItems} resultados
          </p>
        </div>
      )}
    </div>
  );
};
