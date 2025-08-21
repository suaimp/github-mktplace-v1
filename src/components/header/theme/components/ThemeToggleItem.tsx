import React from 'react';
import { useThemeDisplay } from '../hooks/useThemeDisplay';
import { ThemeIcon } from './ThemeIcon';

interface ThemeToggleItemProps {
  onItemClick?: () => void;
  className?: string;
}

/**
 * Componente de item de alternância de tema para uso em dropdowns
 * Responsabilidade: Exibir o controle de tema como um item de menu
 */
export const ThemeToggleItem: React.FC<ThemeToggleItemProps> = ({ 
  onItemClick, 
  className = "flex items-center gap-3 px-3 py-2 w-full font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
}) => {
  const { themeLabel, themeIcon, toggleTheme } = useThemeDisplay();

  const handleClick = () => {
    toggleTheme();
    onItemClick?.();
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
    >
      <ThemeIcon type={themeIcon} />
      <span>{themeLabel}</span>
    </button>
  );
};
