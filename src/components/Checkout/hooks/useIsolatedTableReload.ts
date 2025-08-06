import { useState, useCallback } from 'react';

/**
 * Hook para controlar o recarregamento isolado de uma tabela
 * Permite recarregar apenas a tabela sem afetar outros componentes como tabControls
 */
export function useIsolatedTableReload() {
  const [tableReloadKey, setTableReloadKey] = useState(0);
  const [isTableReloading, setIsTableReloading] = useState(false);

  /**
   * Força o recarregamento apenas da tabela
   */
  const reloadTableOnly = useCallback(() => {
    console.log('🔄 [useIsolatedTableReload] Recarregando apenas a tabela...');
    setIsTableReloading(true);
    setTableReloadKey(prev => prev + 1);
    
    // Reset o estado de loading após um pequeno delay
    setTimeout(() => {
      setIsTableReloading(false);
    }, 100);
  }, []);

  /**
   * Reset o estado da tabela
   */
  const resetTableState = useCallback(() => {
    console.log('🔄 [useIsolatedTableReload] Resetando estado da tabela...');
    setTableReloadKey(0);
    setIsTableReloading(false);
  }, []);

  return {
    tableReloadKey,
    isTableReloading,
    reloadTableOnly,
    resetTableState
  };
}
