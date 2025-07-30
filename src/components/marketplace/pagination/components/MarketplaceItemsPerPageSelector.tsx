import React from 'react';
import { MarketplaceItemsPerPageProps } from '../types';

export const MarketplaceItemsPerPageSelector: React.FC<MarketplaceItemsPerPageProps> = ({
  itemsPerPage,
  onItemsPerPageChange,
  options = [10, 25, 50, 100]
}) => {
  const handleChange = (newValue: number) => {
    onItemsPerPageChange(newValue);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-500 dark:text-gray-400 text-[13px]">Mostrar</span>
      <div className="relative z-20 bg-transparent">
        <select
          className="w-full py-2 pl-3 pr-8 text-[13px] text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          value={itemsPerPage}
          onChange={e => handleChange(Number(e.target.value))}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-[13px]">entradas</span>
    </div>
  );
};
