import { ReactNode } from 'react';
import { getCellIconType, shouldShowCellIcon } from '../services/cellIconDetection';
import { TrafficCellIcon } from './TrafficCellIcon';

interface CellWithIconProps {
  /** Conteúdo da célula */
  children: ReactNode;
  /** Tipo do campo */
  fieldType: string;
  /** Label/nome do campo */
  fieldLabel?: string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Wrapper que adiciona ícones às células quando apropriado
 */
export function CellWithIcon({ 
  children, 
  fieldType, 
  fieldLabel, 
  className = '' 
}: CellWithIconProps) {
  const shouldShow = shouldShowCellIcon(fieldType, fieldLabel);
  
  if (!shouldShow) {
    return <>{children}</>;
  }
  
  const iconType = getCellIconType(fieldType, fieldLabel);
  
  const renderIcon = () => {
    switch (iconType) {
      case 'traffic':
        return <TrafficCellIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <span className="flex-1 min-w-0">
        {children}
      </span>
      {renderIcon()}
    </div>
  );
}
