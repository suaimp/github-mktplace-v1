/**
 * React Context Provider for data synchronization
 * Provides centralized data sync management with single responsibility
 */

import { createContext, useRef, useState, useCallback, useEffect } from 'react';
import { FormEntryEventEmitter } from '../events/FormEntryEventEmitter';
import { 
  DataSyncContextValue, 
  DataSyncProviderProps, 
  FormEntryUpdateEvent, 
  TableRefreshListener 
} from '../types/dataSyncTypes';

const DataSyncContext = createContext<DataSyncContextValue | undefined>(undefined);

export function DataSyncProvider({ children, debugMode = false }: DataSyncProviderProps) {
  const eventEmitterRef = useRef(new FormEntryEventEmitter());
  const [isDebugMode, setIsDebugMode] = useState(debugMode);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventEmitterRef.current.clear();
    };
  }, []);

  // Debug mode logging
  useEffect(() => {
    if (isDebugMode) {
      console.log(`🐛 [DataSyncProvider] Debug mode enabled`);
    }
  }, [isDebugMode]);

  const emitFormEntryUpdate = useCallback((event: Omit<FormEntryUpdateEvent, 'timestamp'>) => {
    const fullEvent: FormEntryUpdateEvent = {
      ...event,
      timestamp: Date.now()
    };

    if (isDebugMode) {
      console.log(`🐛 [DataSyncProvider] Emitting event:`, fullEvent);
    }

    eventEmitterRef.current.emitEvent(fullEvent);
  }, [isDebugMode]);

  const addListener = useCallback((listener: TableRefreshListener): (() => void) => {
    if (isDebugMode) {
      console.log(`🐛 [DataSyncProvider] Adding listener:`, listener);
    }

    return eventEmitterRef.current.addListener(listener);
  }, [isDebugMode]);

  const removeListener = useCallback((listenerId: string) => {
    if (isDebugMode) {
      console.log(`🐛 [DataSyncProvider] Removing listener: ${listenerId}`);
    }

    eventEmitterRef.current.removeListener(listenerId);
  }, [isDebugMode]);

  const refreshAllTables = useCallback(async (formId?: string) => {
    if (isDebugMode) {
      console.log(`🐛 [DataSyncProvider] Refreshing all tables for form: ${formId || 'ALL'}`);
    }

    const refreshEvent: FormEntryUpdateEvent = {
      type: 'FORM_ENTRY_UPDATED',
      entryId: 'bulk-refresh',
      formId: formId || 'all',
      timestamp: Date.now(),
      data: { isBulkRefresh: true }
    };

    await eventEmitterRef.current.emitEvent(refreshEvent);
  }, [isDebugMode]);

  const getActiveListeners = useCallback(() => {
    return eventEmitterRef.current.getActiveListeners();
  }, []);

  const contextValue: DataSyncContextValue = {
    emitFormEntryUpdate,
    addListener,
    removeListener,
    refreshAllTables,
    getActiveListeners,
    isDebugMode,
    setDebugMode: setIsDebugMode
  };

  if (isDebugMode) {
    // Add stats to global object for debugging
    (window as any).__dataSyncStats = () => eventEmitterRef.current.getStats();
  }

  return (
    <DataSyncContext.Provider value={contextValue}>
      {children}
    </DataSyncContext.Provider>
  );
}

export { DataSyncContext };
