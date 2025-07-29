import React from 'react';
import { PaginationInfoProps } from '../types';

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  itemLabel = "registros"
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
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
  );
};
