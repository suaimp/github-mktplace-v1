import { CacheEntry, CacheKey, CacheConfig } from './types';

export class PaginationCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxAge: config.maxAge || 5 * 60 * 1000, // 5 minutes default
      maxEntries: config.maxEntries || 50
    };
  }

  private generateCacheKey(key: CacheKey): string {
    return JSON.stringify({
      page: key.page,
      itemsPerPage: key.itemsPerPage || 10, // CORREÇÃO: Incluir itemsPerPage na chave
      searchTerm: key.searchTerm || '',
      statusFilter: key.statusFilter || '',
      sortField: key.sortField || '',
      sortDirection: key.sortDirection || '',
      formId: key.formId || ''
    });
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.maxAge;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  private enforceMaxEntries(): void {
    if (this.cache.size > this.config.maxEntries) {
      // Remove oldest entries first (FIFO)
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const entriesToRemove = sortedEntries.slice(0, this.cache.size - this.config.maxEntries);
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get(key: CacheKey): CacheEntry<T> | null {
    this.cleanupExpiredEntries();
    
    const cacheKey = this.generateCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(cacheKey);
      }
      return null;
    }
    
    return entry;
  }

  set(key: CacheKey, data: T[], totalItems: number, totalPages: number): void {
    this.cleanupExpiredEntries();
    this.enforceMaxEntries();
    
    const cacheKey = this.generateCacheKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      totalItems,
      totalPages
    };
    
    this.cache.set(cacheKey, entry);
  }

  invalidate(partialKey?: Partial<CacheKey>): void {
    if (!partialKey) {
      // Clear all cache
      this.cache.clear();
      return;
    }

    // Clear entries that match the partial key
    for (const [key] of this.cache.entries()) {
      const parsedKey = JSON.parse(key) as CacheKey;
      let shouldInvalidate = true;

      for (const [prop, value] of Object.entries(partialKey)) {
        if (parsedKey[prop as keyof CacheKey] !== value) {
          shouldInvalidate = false;
          break;
        }
      }

      if (shouldInvalidate) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanupExpiredEntries();
    return this.cache.size;
  }
}
