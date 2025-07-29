/**
 * Types for the data synchronization system
 * Maintains single responsibility for type definitions
 */

export interface FormEntryUpdateEvent {
  type: 'FORM_ENTRY_UPDATED' | 'FORM_ENTRY_CREATED' | 'FORM_ENTRY_DELETED';
  entryId: string;
  formId: string;
  timestamp: number;
  data?: any;
}

export interface TableRefreshListener {
  id: string;
  formId?: string; // If undefined, listens to all forms
  callback: (event: FormEntryUpdateEvent) => Promise<void> | void;
  priority?: number; // Higher numbers execute first
}

export interface DataSyncContextValue {
  // Event emission
  emitFormEntryUpdate: (event: Omit<FormEntryUpdateEvent, 'timestamp'>) => void;
  
  // Listener management
  addListener: (listener: TableRefreshListener) => () => void; // Returns unsubscribe function
  removeListener: (listenerId: string) => void;
  
  // Utility functions
  refreshAllTables: (formId?: string) => Promise<void>;
  getActiveListeners: () => TableRefreshListener[];
  
  // Debug information
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
}

export interface DataSyncProviderProps {
  children: React.ReactNode;
  debugMode?: boolean;
}

export interface UseDataSyncOptions {
  formId?: string;
  listenerId?: string;
  priority?: number;
  autoRefresh?: boolean;
}

export interface DataSyncStats {
  totalListeners: number;
  activeListeners: number;
  eventCount: number;
  lastEventTimestamp?: number;
}
