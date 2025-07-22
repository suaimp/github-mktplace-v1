import React from "react";

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  fieldType?: string;
  style?: React.CSSProperties;
}

/**
 * Componente para células da tabela com centralização otimizada
 */
export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = "", 
  fieldType = "",
  style 
}) => {
  const getCellClass = () => {
    const baseClass = "whitespace-nowrap px-2 py-2 text-theme-2xs xl:text-sm text-gray-700 dark:text-gray-300";
    
    switch (fieldType) {
      case "url":
      case "site_url":
        return `${baseClass} url-cell`;
      case "product":
        return `${baseClass} price-cell`;
      case "moz_da":
      case "semrush_as":
      case "ahrefs_dr":
        return `${baseClass} metric-cell`;
      case "button_buy":
        return `${baseClass} button-cell`;
      case "checkbox":
        return `${baseClass} checkbox-cell`;
      default:
        return baseClass;
    }
  };

  return (
    <td 
      className={`${getCellClass()} ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center">
        {children}
      </div>
    </td>
  );
};

export default TableCell;
