import React from 'react';
import { ItemsPerPageSelectorProps } from '../types';

export const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  itemLabel = "registros",
  options = [10, 25, 50, 100],
  className = ""
}) => {
  const handleChange = (newValue: number) => {
    onItemsPerPageChange(newValue);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-gray-500 dark:text-gray-400">Mostrar</span>
      <div className="relative z-20 bg-transparent">
        <select
          className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          value={itemsPerPage}
          onChange={e => handleChange(Number(e.target.value))}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
          <svg
            className="stroke-current"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
              stroke=""
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <span className="text-gray-500 dark:text-gray-400">{itemLabel}</span>
    </div>
  );
};
