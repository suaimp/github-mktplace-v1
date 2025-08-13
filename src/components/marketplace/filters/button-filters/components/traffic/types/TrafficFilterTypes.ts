import { CustomRange } from '../../base/types/RangeFilterTypes';

/**
 * Interface for traffic filter intervals
 */
export interface TrafficRangeItem {
  id: string;
  label: string;
  min: number;
  max: number | null; // null means no upper limit
}

/**
 * Interface for traffic filter criteria
 */
export interface TrafficFilterCriteria {
  selectedIntervals: string[];
  customRange?: CustomRange | null;
}

/**
 * Interface for traffic filter state
 */
export interface TrafficFilterState {
  selectedIntervals: string[];
  customRange: CustomRange | null;
  isOpen: boolean;
  intervalCounts: Record<string, number>;
}

/**
 * Interface for traffic filter hook return
 */
export interface UseTrafficFilterReturn {
  state: TrafficFilterState;
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
 * Generic Site interface for traffic filtering
 * Represents marketplace entry data with dynamic properties
 */
export interface Site {
  [key: string]: any;
  ahrefs_traffic?: number;
  similarweb_traffic?: number;
  google_traffic?: number;
}
