/**
 * Service responsible for cache management and data refresh operations
 * Maintains single responsibility principle for cache-related operations
 */
export class CacheRefreshService {
  /**
   * Refreshes marketplace cache data for a specific form
   * This is called after form submission to ensure data consistency
   */
  static async refreshMarketplaceCache(formId: string): Promise<void> {
    try {
      console.log(`🔄 [CacheRefreshService] Refreshing marketplace cache for form: ${formId}`);
      
      // Get the marketplace cache refresh function if available
      // This will be injected through a callback mechanism
      const refreshCallback = this.marketplaceCacheRefreshCallback;
      
      if (refreshCallback) {
        await refreshCallback(formId);
        console.log(`✅ [CacheRefreshService] Marketplace cache refreshed successfully`);
      } else {
        console.warn(`⚠️ [CacheRefreshService] No marketplace cache refresh callback registered`);
      }
    } catch (error) {
      console.error(`❌ [CacheRefreshService] Error refreshing marketplace cache:`, error);
      // Don't throw - cache refresh failures shouldn't break form submission
    }
  }

  /**
   * Refreshes editorial manager cache data for a specific form
   * This is called after form submission to update the entries table
   */
  static async refreshEditorialCache(formId: string): Promise<void> {
    try {
      console.log(`🔄 [CacheRefreshService] Refreshing editorial cache for form: ${formId}`);
      
      // Get the editorial cache refresh function if available
      const refreshCallback = this.editorialCacheRefreshCallback;
      
      if (refreshCallback) {
        await refreshCallback(formId);
        console.log(`✅ [CacheRefreshService] Editorial cache refreshed successfully`);
      } else {
        console.warn(`⚠️ [CacheRefreshService] No editorial cache refresh callback registered`);
      }
    } catch (error) {
      console.error(`❌ [CacheRefreshService] Error refreshing editorial cache:`, error);
      // Don't throw - cache refresh failures shouldn't break form submission
    }
  }

  /**
   * Clears all caches for a specific form
   * Use this when you need to force a complete refresh
   */
  static async clearAllCaches(formId: string): Promise<void> {
    try {
      console.log(`🧹 [CacheRefreshService] Clearing all caches for form: ${formId}`);
      
      // Clear marketplace cache
      const marketplaceClearCallback = this.marketplaceCacheClearCallback;
      if (marketplaceClearCallback) {
        await marketplaceClearCallback(formId);
      }

      // Clear editorial cache
      const editorialClearCallback = this.editorialCacheClearCallback;
      if (editorialClearCallback) {
        await editorialClearCallback(formId);
      }

      console.log(`✅ [CacheRefreshService] All caches cleared successfully`);
    } catch (error) {
      console.error(`❌ [CacheRefreshService] Error clearing caches:`, error);
      // Don't throw - cache clear failures shouldn't break other operations
    }
  }

  /**
   * Refreshes both marketplace and editorial caches
   * This is the main method called after form submission
   */
  static async refreshAllCaches(formId: string): Promise<void> {
    console.log(`🔄 [CacheRefreshService] Starting comprehensive cache refresh for form: ${formId}`);
    
    // Run both refresh operations in parallel for better performance
    await Promise.allSettled([
      this.refreshMarketplaceCache(formId),
      this.refreshEditorialCache(formId)
    ]);

    console.log(`✅ [CacheRefreshService] Comprehensive cache refresh completed`);
  }

  // Callback registration methods - these will be set by the respective hooks
  private static marketplaceCacheRefreshCallback: ((formId: string) => Promise<void>) | null = null;
  private static editorialCacheRefreshCallback: ((formId: string) => Promise<void>) | null = null;
  private static marketplaceCacheClearCallback: ((formId: string) => Promise<void>) | null = null;
  private static editorialCacheClearCallback: ((formId: string) => Promise<void>) | null = null;

  /**
   * Registers a callback for marketplace cache refresh
   */
  static registerMarketplaceCacheRefresh(callback: (formId: string) => Promise<void>): void {
    this.marketplaceCacheRefreshCallback = callback;
  }

  /**
   * Registers a callback for editorial cache refresh
   */
  static registerEditorialCacheRefresh(callback: (formId: string) => Promise<void>): void {
    this.editorialCacheRefreshCallback = callback;
  }

  /**
   * Registers a callback for marketplace cache clear
   */
  static registerMarketplaceCacheClear(callback: (formId: string) => Promise<void>): void {
    this.marketplaceCacheClearCallback = callback;
  }

  /**
   * Registers a callback for editorial cache clear
   */
  static registerEditorialCacheClear(callback: (formId: string) => Promise<void>): void {
    this.editorialCacheClearCallback = callback;
  }

  /**
   * Unregisters all callbacks - useful for cleanup
   */
  static unregisterAllCallbacks(): void {
    this.marketplaceCacheRefreshCallback = null;
    this.editorialCacheRefreshCallback = null;
    this.marketplaceCacheClearCallback = null;
    this.editorialCacheClearCallback = null;
  }
}
