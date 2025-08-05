import { AnalyticsIcon } from '../../../../icons';

interface TrafficCellIconProps {
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Ícone específico para células de tráfego
 */
export function TrafficCellIcon({ className = '' }: TrafficCellIconProps) {
  return (
    <AnalyticsIcon 
      className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 ${className}`}
    />
  );
}
