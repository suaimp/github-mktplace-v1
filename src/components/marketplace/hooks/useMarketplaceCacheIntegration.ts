/**
 * Hook for marketplace cache integration with CacheRefreshService
 * This hook registers marketplace cache callbacks when the component mounts
 * and provides marketplace-specific cache management
 */
import { useEffect } from 'react';
import { useCachedMarketplaceData } from '../hooks/useCachedMarketplaceData';
import { CacheRefreshService } from '../../EditorialManager/services/cacheRefreshService';

export function useMarketplaceCacheIntegration(formId: string) {
  // Get the base marketplace data hook
  const marketplaceData = useCachedMarketplaceData(formId);

  // Register marketplace cache callbacks
  useEffect(() => {
    if (formId && marketplaceData.refreshData && marketplaceData.clearCache) {
      // Register refresh callback
      CacheRefreshService.registerMarketplaceCacheRefresh(async () => {
        console.log(`🔄 [MarketplaceCacheIntegration] Refreshing marketplace cache for form: ${formId}`);
        await marketplaceData.refreshData();
      });

      // Register clear callback
      CacheRefreshService.registerMarketplaceCacheClear(async () => {
        console.log(`🧹 [MarketplaceCacheIntegration] Clearing marketplace cache for form: ${formId}`);
        await marketplaceData.clearCache();
      });

      console.log(`✅ [MarketplaceCacheIntegration] Cache callbacks registered for form: ${formId}`);
    }

    // Cleanup on unmount or formId change
    return () => {
      if (formId) {
        console.log(`🧹 [MarketplaceCacheIntegration] Cleaning up cache callbacks for form: ${formId}`);
        // Note: We don't unregister all callbacks here as other components might be using them
        // The CacheRefreshService handles multiple registrations gracefully
      }
    };
  }, [formId, marketplaceData.refreshData, marketplaceData.clearCache]);

  return marketplaceData;
}
