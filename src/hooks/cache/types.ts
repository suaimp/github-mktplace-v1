export interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  totalItems: number;
  totalPages: number;
}

export interface CacheKey {
  page: number;
  searchTerm?: string;
  statusFilter?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  formId?: string;
}

export interface CacheConfig {
  maxAge?: number; // in milliseconds, default 5 minutes
  maxEntries?: number; // maximum number of cached pages, default 50
}
