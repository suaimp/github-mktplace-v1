/**
 * Main export file for the data synchronization system
 * Provides centralized exports following single responsibility principle
 */

// Context and Provider
export { DataSyncProvider, DataSyncContext } from './context/DataSyncProvider';

// Main hooks
export { useDataSync, useTableDataSync } from './hooks/useDataSync';
export { useFormDataSync } from './hooks/useFormDataSync';

// Types
export type {
  FormEntryUpdateEvent,
  TableRefreshListener,
  DataSyncContextValue,
  DataSyncProviderProps,
  UseDataSyncOptions,
  DataSyncStats
} from './types/dataSyncTypes';

// Events (for advanced usage)
export { FormEntryEventEmitter } from './events/FormEntryEventEmitter';
