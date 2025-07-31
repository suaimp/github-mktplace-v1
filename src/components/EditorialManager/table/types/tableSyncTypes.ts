/**
 * Types specific to table data synchronization
 * Maintains single responsibility for table sync type definitions
 */

export interface TableSyncOptions {
  listenerId?: string;
  priority?: number;
  autoRefresh?: boolean;
}

export interface TableRefreshCallback {
  (): Promise<void> | void;
}

export interface TableSyncHookReturn {
  isListening: boolean;
  lastRefresh: Date | null;
  refreshCount: number;
}
