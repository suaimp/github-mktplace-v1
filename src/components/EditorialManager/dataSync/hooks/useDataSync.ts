/**
 * Main hook for using the data synchronization system
 * Provides easy access to data sync functionality with single responsibility
 */

import { useContext, useEffect, useRef } from 'react';
import { DataSyncContext } from '../context/DataSyncProvider';
import { UseDataSyncOptions, FormEntryUpdateEvent } from '../types/dataSyncTypes';

export function useDataSync(options: UseDataSyncOptions = {}) {
  const context = useContext(DataSyncContext);
  const optionsRef = useRef(options);

  // Update options ref when options change
  optionsRef.current = options;

  if (!context) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }

  const {
    emitFormEntryUpdate,
    addListener,
    removeListener,
    refreshAllTables,
    getActiveListeners,
    isDebugMode
  } = context;

  // Register a listener for automatic table refresh
  useEffect(() => {
    if (!optionsRef.current.autoRefresh) return;

    const listenerId = optionsRef.current.listenerId || `auto-refresh-${Date.now()}`;
    
    const listener = {
      id: listenerId,
      formId: optionsRef.current.formId,
      priority: optionsRef.current.priority || 0,
      callback: async (event: FormEntryUpdateEvent) => {
        if (isDebugMode) {
          console.log(`🔄 [useDataSync] Auto-refresh triggered for listener: ${listenerId}`, event);
        }
        
        // This would trigger a refresh in the component that uses this hook
        // The actual refresh logic should be implemented in the component
      }
    };

    const unsubscribe = addListener(listener);

    if (isDebugMode) {
      console.log(`🔗 [useDataSync] Auto-refresh listener registered: ${listenerId}`);
    }

    return unsubscribe;
  }, [addListener, isDebugMode]);

  return {
    // Event emission
    emitFormEntryUpdate,
    
    // Listener management
    addListener,
    removeListener,
    
    // Utility functions
    refreshAllTables,
    getActiveListeners,
    
    // Debug info
    isDebugMode,
    
    // Convenience methods
    emitEntryCreated: (entryId: string, formId: string, data?: any) => {
      emitFormEntryUpdate({
        type: 'FORM_ENTRY_CREATED',
        entryId,
        formId,
        data
      });
    },
    
    emitEntryUpdated: (entryId: string, formId: string, data?: any) => {
      emitFormEntryUpdate({
        type: 'FORM_ENTRY_UPDATED',
        entryId,
        formId,
        data
      });
    },
    
    emitEntryDeleted: (entryId: string, formId: string, data?: any) => {
      emitFormEntryUpdate({
        type: 'FORM_ENTRY_DELETED',
        entryId,
        formId,
        data
      });
    }
  };
}

/**
 * Hook specifically for table components that need to refresh when data changes
 */
export function useTableDataSync(
  formId: string,
  refreshCallback: () => Promise<void> | void,
  options: { listenerId?: string; priority?: number } = {}
) {
  const { addListener, isDebugMode } = useDataSync();
  const refreshCallbackRef = useRef(refreshCallback);

  // Update callback ref when it changes
  refreshCallbackRef.current = refreshCallback;

  useEffect(() => {
    const listenerId = options.listenerId || `table-sync-${formId}-${Date.now()}`;
    
    const listener = {
      id: listenerId,
      formId: formId,
      priority: options.priority || 0,
      callback: async (event: FormEntryUpdateEvent) => {
        if (isDebugMode) {
          console.log(
            `🔄 [useTableDataSync] Refreshing table for form: ${formId}, event: ${event.type}`
          );
        }
        
        try {
          await Promise.resolve(refreshCallbackRef.current());
          
          if (isDebugMode) {
            console.log(`✅ [useTableDataSync] Table refresh completed for form: ${formId}`);
          }
        } catch (error) {
          console.error(`❌ [useTableDataSync] Table refresh failed for form: ${formId}:`, error);
        }
      }
    };

    const unsubscribe = addListener(listener);

    if (isDebugMode) {
      console.log(`🔗 [useTableDataSync] Table listener registered: ${listenerId} for form: ${formId}`);
    }

    return unsubscribe;
  }, [addListener, formId, isDebugMode, options.listenerId, options.priority]);
}
