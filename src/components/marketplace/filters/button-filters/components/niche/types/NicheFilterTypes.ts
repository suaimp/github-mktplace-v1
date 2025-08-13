/**
 * Types for Niche Filter Component
 * Responsability: Define interfaces and types for niche filtering functionality
 */

/**
 * Interface for niche option (from niche_rendering)
 */
export interface NicheOption {
  text: string;
  icon?: string;
}

/**
 * Interface for niche filter item
 */
export interface NicheFilterItem {
  text: string;
  icon?: string;
  count: number;
  isSelected: boolean;
}

/**
 * Interface for niche filter criteria
 */
export interface NicheFilterCriteria {
  selectedNiches: string[];
}

/**
 * Interface for niche filter state
 */
export interface NicheFilterState {
  selectedNiches: string[];
  isOpen: boolean;
  searchTerm: string;
  allNiches: NicheFilterItem[];
}

/**
 * Interface for niche filter hook return
 */
export interface UseNicheFilterReturn {
  state: NicheFilterState;
  isOpen: boolean;
  searchTerm: string;
  selectedCount: number;
  filteredNiches: NicheFilterItem[];
  setIsOpen: (open: boolean) => void;
  setSearchTerm: (term: string) => void;
  toggleNiche: (nicheText: string) => void;
  clearFilters: () => void;
  isActive: boolean;
  getFilterFunction: () => ((entry: any) => boolean) | null;
  getActiveFiltersCount: () => number;
  getActiveFiltersText: () => string;
}

/**
 * Generic Site interface for niche filtering
 * Represents marketplace entry data with dynamic properties
 */
export interface NicheSite {
  [key: string]: any;
  values?: {
    [fieldId: string]: any;
  };
}

/**
 * Interface for parsed niche data from entry
 */
export interface ParsedNicheData {
  niches: NicheOption[];
  rawValue: any;
}
