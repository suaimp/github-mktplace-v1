import React from 'react';

interface MarketplaceFilterSeparatorProps {
  className?: string;
}

export const MarketplaceFilterSeparator: React.FC<MarketplaceFilterSeparatorProps> = ({
  className = ''
}) => {
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 -mx-1 h-px ${className}`}
      role="separator"
    />
  );
};
