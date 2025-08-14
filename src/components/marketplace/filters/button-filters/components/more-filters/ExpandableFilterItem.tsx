/**
 * Item de filtro expansível para modal de filtros adicionais
 * Responsabilidade: Renderizar um filtro como menu dropdown abre/fecha
 */

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../../../../../../icons';

interface ExpandableFilterItemProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const ExpandableFilterItem: React.FC<ExpandableFilterItemProps> = ({
  title,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </span>
        <div className="flex-shrink-0 ml-2">
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
};
