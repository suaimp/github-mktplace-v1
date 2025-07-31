/**
 * Table module exports
 * Centralizes all table-related exports maintaining single responsibility
 */

// Hooks
export { useEnhancedTableSync } from './hooks/useEnhancedTableSync';

// Types
export type { 
  TableSyncOptions, 
  TableRefreshCallback, 
  TableSyncHookReturn 
} from './types/tableSyncTypes';

// Components
export { default as EntriesTableSkeleton } from './EntriesTableSkeleton';
export { TableControls, SearchStats } from './components';
