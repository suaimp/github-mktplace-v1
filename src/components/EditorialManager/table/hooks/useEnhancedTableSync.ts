/**
 * Enhanced table data sync hook with additional features
 * Maintains single responsibility for table-specific synchronization
 */

import { useState, useEffect, useRef } from 'react';
import { useTableDataSync } from '../../dataSync/hooks/useDataSync';
import { TableSyncOptions, TableRefreshCallback, TableSyncHookReturn } from '../types/tableSyncTypes';

export function useEnhancedTableSync(
  formId: string,
  refreshCallback: TableRefreshCallback,
  options: TableSyncOptions = {}
): TableSyncHookReturn {
  const [isListening, setIsListening] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  
  const refreshCallbackRef = useRef(refreshCallback);
  refreshCallbackRef.current = refreshCallback;

  // Enhanced callback with tracking
  const enhancedCallback = async () => {
    try {
      await Promise.resolve(refreshCallbackRef.current());
      setLastRefresh(new Date());
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error(`[useEnhancedTableSync] Refresh failed for form ${formId}:`, error);
    }
  };

  // Use the core table sync hook
  useTableDataSync(
    formId,
    enhancedCallback,
    {
      listenerId: options.listenerId || `enhanced-table-${formId}`,
      priority: options.priority || 1
    }
  );

  useEffect(() => {
    setIsListening(true);
    return () => setIsListening(false);
  }, [formId]);

  return {
    isListening,
    lastRefresh,
    refreshCount
  };
}
