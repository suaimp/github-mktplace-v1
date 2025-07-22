import React from "react";

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
  isSortable?: boolean;
  onClick?: () => void;
  scope?: string;
  style?: React.CSSProperties;
}

/**
 * Componente para headers da tabela com centralização otimizada
 */
export const TableHeader: React.FC<TableHeaderProps> = ({ 
  children, 
  className = "", 
  isSortable = false,
  onClick,
  scope = "col",
  style 
}) => {
  const getHeaderClass = () => {
    let baseClass = "px-2 py-2.5 text-center text-theme-2xs xl:text-sm font-semibold text-gray-900 dark:text-white";
    
    if (isSortable) {
      baseClass += " cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700";
    }
    
    return baseClass;
  };

  return (
    <th 
      scope={scope}
      className={`${getHeaderClass()} ${className}`}
      onClick={isSortable ? onClick : undefined}
      style={style}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
      </div>
    </th>
  );
};

export default TableHeader;
