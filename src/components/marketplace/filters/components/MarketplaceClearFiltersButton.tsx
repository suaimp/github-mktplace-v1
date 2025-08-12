import React from 'react';

interface MarketplaceClearFiltersButtonProps {
  onClearFilters: () => void;
  className?: string;
}

export const MarketplaceClearFiltersButton: React.FC<MarketplaceClearFiltersButtonProps> = ({
  onClearFilters,
  className = ''
}) => {
  return (
    <div 
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 text-sm outline-none select-none justify-center text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-1 h-[30px] focus:outline-none ${className}`}
      onClick={onClearFilters}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClearFilters();
        }
      }}
    >
      <span className="text-gray-700 dark:text-gray-300 font-medium">Limpar filtros</span>
    </div>
  );
};
