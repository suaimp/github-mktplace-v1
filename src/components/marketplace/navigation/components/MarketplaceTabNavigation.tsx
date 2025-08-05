import { MarketplaceTabNavigationProps } from '../types';
import MarketplaceTabButton from './MarketplaceTabButton';

/**
 * Componente de navegação por tabs específico para marketplace com suporte a ícones
 */
export default function MarketplaceTabNavigation({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  compact = false
}: MarketplaceTabNavigationProps) {
  // Classes base do container
  const containerClasses = [
    'flex',
    'rounded-lg',
    'bg-gray-100',
    'dark:bg-gray-900',
    'h-11',
    'items-center',
    compact ? 'p-0.5' : 'p-1',
    'gap-1',
    'flex-nowrap',
    'min-w-0',
    className
  ].filter(Boolean).join(' ');

  // Estilo para min-width: max-content
  const containerStyle = {
    minWidth: 'max-content'
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav 
      className={containerClasses}
      style={containerStyle}
      role="tablist"
      aria-label="Navegação por tabs do marketplace"
    >
      {tabs.map((tab) => (
        <MarketplaceTabButton
          key={tab.id}
          tab={tab}
          isActive={activeTabId === tab.id}
          onClick={onTabChange}
          compact={compact}
        />
      ))}
    </nav>
  );
}
