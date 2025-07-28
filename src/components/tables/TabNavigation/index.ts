/**
 * Módulo TabNavigation - Componente reutilizável para navegação por tabs
 * 
 * Este módulo fornece um sistema completo de tabs reutilizável que pode ser
 * usado em diferentes partes da aplicação, especialmente em tabelas.
 * 
 * Características:
 * - Suporte a tema dark/light
 * - Logs detalhados para debugging
 * - Tabs desabilitadas
 * - Modo compacto
 * - Scrolling horizontal automático
 * - Totalmente acessível (ARIA)
 * 
 * @example
 * ```tsx
 * import { TabNavigation, useTabNavigation } from '@/components/tables/TabNavigation';
 * 
 * const tabs = [
 *   { id: 'overview', label: 'Overview' },
 *   { id: 'notification', label: 'Notification' },
 *   { id: 'analytics', label: 'Analytics' },
 * ];
 * 
 * function MyComponent() {
 *   const { activeTabId, handleTabChange } = useTabNavigation(tabs);
 *   
 *   return (
 *     <TabNavigation
 *       tabs={tabs}
 *       activeTabId={activeTabId}
 *       onTabChange={handleTabChange}
 *     />
 *   );
 * }
 * ```
 */

// Exports principais
export { TabNavigation } from './components';
export { useTabNavigation } from './hooks';
export type { Tab, TabNavigationProps, TabButtonProps } from './types';
