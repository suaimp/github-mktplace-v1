import React from 'react';
import { SortableField, SortDirection } from '../types';

interface SortableHeaderProps {
  field: SortableField;
  label: string;
  sortField: SortableField;
  sortDirection: SortDirection;
  onSort: (field: SortableField) => void;
  sortable?: boolean;
  className?: string;
}

/**
 * Componente para cabeçalho de coluna ordenável
 */
export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
  sortable = true,
  className = ""
}) => {
  const isCurrentSort = sortField === field;
  const showSortIndicator = sortable && isCurrentSort;

  const handleClick = () => {
    if (sortable) {
      onSort(field);
    }
  };

  return (
    <div
      className={`
        h-12 relative font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400
        ${className}
      `}
    >
      <div
        className={`
          absolute inset-0 w-full h-full flex items-center gap-1 text-left outline-none px-5 py-3
          ${sortable 
            ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700' 
            : 'cursor-default'
          }
        `}
        onClick={handleClick}
        role={sortable ? "button" : undefined}
        tabIndex={sortable ? 0 : undefined}
        onKeyDown={(e) => {
          if (sortable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <span>{label}</span>
        {sortable && (
          <span className="flex flex-col gap-0.5 ml-1">
            {/* Seta para cima */}
            <svg
              className={`${
                showSortIndicator && sortDirection === 'asc'
                  ? 'fill-brand-500 dark:fill-brand-400'
                  : 'fill-gray-300 dark:fill-gray-700'
              }`}
              width="8"
              height="5"
              viewBox="0 0 8 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z" />
            </svg>
            {/* Seta para baixo */}
            <svg
              className={`${
                showSortIndicator && sortDirection === 'desc'
                  ? 'fill-brand-500 dark:fill-brand-400'
                  : 'fill-gray-300 dark:fill-gray-700'
              }`}
              width="8"
              height="5"
              viewBox="0 0 8 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
};
