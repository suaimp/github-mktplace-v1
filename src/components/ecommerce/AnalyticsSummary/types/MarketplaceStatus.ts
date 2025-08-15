/**
 * Tipos relacionados às configurações de marketplace
 */

export interface MarketplaceStatusConfig {
  isInTest: boolean;
  isInMaintenance: boolean;
  testMessage: string | null;
  maintenanceMessage: string | null;
}

export interface MarketplaceStatusHookReturn {
  config: MarketplaceStatusConfig | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
