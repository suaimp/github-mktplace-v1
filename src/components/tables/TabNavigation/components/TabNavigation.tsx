import { TabNavigationProps } from '../types';
import TabButton from './TabButton';

/**
 * Componente principal de navegação por tabs
 * Baseado no design fornecido com suporte a temas dark/light
 */
export default function TabNavigation({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
  compact = false,
  buttonMinWidth
}: TabNavigationProps) {
  // Classes base do container
  const containerClasses = [
    'flex',
    'rounded-lg',
    'bg-gray-100',
    'dark:bg-gray-900',
    'h-11', // altura padrão igual ao input
    'items-center', // alinhamento vertical
    compact ? 'p-0.5' : 'p-1',
    'gap-1',
    // Garantir que não quebre em telas pequenas
    'flex-nowrap',
    'min-w-0',
    className
  ].filter(Boolean).join(' ');

  // Estilo para min-width: max-content
  const containerStyle = {
    minWidth: 'max-content'
  };

  if (tabs.length === 0) {
    console.warn('⚠️ [TabNavigation] Nenhuma tab fornecida');
    return null;
  }

  console.log(`📋 [TabNavigation] Renderizando ${tabs.length} tabs, ativa: ${activeTabId}`);

  return (
    <nav 
      className={containerClasses}
      style={containerStyle}
      role="tablist"
      aria-label="Navegação por tabs"
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTabId === tab.id}
          onClick={onTabChange}
          compact={compact}
          minWidth={buttonMinWidth}
        />
      ))}
    </nav>
  );
}
