import React, { useMemo, useCallback } from "react";
import { TabNavigation, useTabNavigation } from "../../../tables/TabNavigation";

interface StatusTabsProps {
  statusFilter: string;
  onStatusFilterChange: (statusFilter: string) => void;
  onPageReset: () => void;
  statusCounts: {
    todos: number;
    em_analise: number;
    verificado: number;
    reprovado: number;
  };
}

const StatusTabs = React.memo(({ 
  statusFilter, 
  onStatusFilterChange, 
  onPageReset, 
  statusCounts 
}: StatusTabsProps) => {
  // Memoizar tabs para evitar recriação a cada render
  const tabs = useMemo(() => [
    { id: 'todos', label: 'Todos', count: statusCounts.todos },
    { id: 'em_analise', label: 'Em Análise', count: statusCounts.em_analise },
    { id: 'verificado', label: 'Verificado', count: statusCounts.verificado },
    { id: 'reprovado', label: 'Reprovado', count: statusCounts.reprovado }
  ], [statusCounts.todos, statusCounts.em_analise, statusCounts.verificado, statusCounts.reprovado]);

  // Hook para gerenciar as tabs
  const { activeTabId, handleTabChange } = useTabNavigation(tabs, statusFilter);

  // Handler personalizado para mudança de tab que também notifica o componente pai
  const handleTabChangeWithCallback = useCallback((tabId: string) => {
    handleTabChange(tabId);
    onStatusFilterChange(tabId);
    onPageReset(); // Reset pagination when filter changes
  }, [handleTabChange, onStatusFilterChange, onPageReset]);

  return (
    <TabNavigation
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={handleTabChangeWithCallback}
      compact
      buttonMinWidth="120px"
      className="h-11 items-center"
    />
  );
});

StatusTabs.displayName = 'StatusTabs';

export default StatusTabs;
