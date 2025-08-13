import { CustomRange } from '../../base/types/RangeFilterTypes';

/**
 * Interface for price filter intervals
 */
export interface PriceRangeItem {
  id: string;
  label: string;
  min: number;
  max: number | null; // null means no upper limit
}

/**
 * Interface for price filter criteria
 */
export interface PriceFilterCriteria {
  selectedIntervals: string[];
  customRange?: CustomRange | null;
}

/**
 * Interface for price filter state
 */
export interface PriceFilterState {
  selectedIntervals: string[];
  customRange: CustomRange | null;
  isOpen: boolean;
  intervalCounts: Record<string, number>;
}

/**
 * Interface for price filter hook return
 */
export interface UsePriceFilterReturn {
  state: PriceFilterState;
  tempCustomRange: CustomRange;
  isOpen: boolean;
  hasSelectedItems: boolean;
  toggleInterval: (intervalId: string) => void;
  setCustomRange: (range: CustomRange) => void;
  applyCustomRange: () => void;
  clearAll: () => void;
  setIsOpen: (open: boolean) => void;
  isActive: boolean;
  getFilterFunction: () => ((entry: any) => boolean) | null;
  getActiveFiltersCount: () => number;
  getActiveFiltersText: () => string;
}

/**
 * Generic Site interface for price filtering
 * Represents marketplace entry data with dynamic properties
 */
export interface PriceSite {
  [key: string]: any;
  values?: {
    [fieldId: string]: any;
  };
}

/**
 * Product data structure for price calculation
 */
export interface ProductData {
  price?: string | number;
  promotional_price?: string | number;
  old_price?: string | number;
  old_promotional_price?: string | number;
  [key: string]: any;
}
