import { useState, useCallback } from 'react';
import { Tab } from '../types';

/**
 * Hook para gerenciar o estado das tabs com logs
 */
export function useTabNavigation(tabs: Tab[], initialTabId?: string) {
  // Define a tab inicial
  const getInitialTab = () => {
    if (initialTabId && tabs.find(tab => tab.id === initialTabId)) {
      return initialTabId;
    }
    return tabs[0]?.id || '';
  };

  const [activeTabId, setActiveTabId] = useState<string>(getInitialTab());

  /**
   * Altera a tab ativa e registra logs
   */
  const handleTabChange = useCallback((tabId: string) => {
    const selectedTab = tabs.find(tab => tab.id === tabId);
    
    if (!selectedTab) {
      console.warn(`🚫 [TabNavigation] Tab não encontrada: ${tabId}`);
      return;
    }

    if (selectedTab.disabled) {
      console.warn(`🚫 [TabNavigation] Tab desabilitada: ${tabId}`);
      return;
    }

    const previousTab = tabs.find(tab => tab.id === activeTabId);
    
    console.log(`🔄 [TabNavigation] Alternando tabs:`);
    console.log(`   De: ${previousTab?.label || 'N/A'} (${activeTabId})`);
    console.log(`   Para: ${selectedTab.label} (${tabId})`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    setActiveTabId(tabId);
  }, [tabs, activeTabId]);

  /**
   * Reseta para a primeira tab
   */
  const resetToFirstTab = useCallback(() => {
    const firstTab = tabs[0];
    if (firstTab) {
      console.log(`🔄 [TabNavigation] Resetando para primeira tab: ${firstTab.label}`);
      handleTabChange(firstTab.id);
    }
  }, [tabs, handleTabChange]);

  /**
   * Vai para próxima tab
   */
  const goToNextTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    const nextIndex = (currentIndex + 1) % tabs.length;
    const nextTab = tabs[nextIndex];
    
    if (nextTab && !nextTab.disabled) {
      console.log(`➡️ [TabNavigation] Avançando para próxima tab: ${nextTab.label}`);
      handleTabChange(nextTab.id);
    }
  }, [tabs, activeTabId, handleTabChange]);

  /**
   * Vai para tab anterior
   */
  const goToPreviousTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    const prevIndex = currentIndex - 1 < 0 ? tabs.length - 1 : currentIndex - 1;
    const prevTab = tabs[prevIndex];
    
    if (prevTab && !prevTab.disabled) {
      console.log(`⬅️ [TabNavigation] Retrocedendo para tab anterior: ${prevTab.label}`);
      handleTabChange(prevTab.id);
    }
  }, [tabs, activeTabId, handleTabChange]);

  return {
    activeTabId,
    handleTabChange,
    resetToFirstTab,
    goToNextTab,
    goToPreviousTab,
    // Estado adicional
    currentTab: tabs.find(tab => tab.id === activeTabId),
    tabCount: tabs.length,
    currentIndex: tabs.findIndex(tab => tab.id === activeTabId)
  };
}
