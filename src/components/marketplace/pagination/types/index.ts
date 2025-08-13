import { ReactNode } from 'react';
import { FilterGroup } from '../../filters/types';

export interface MarketplacePaginationParams {
  page: number;
  limit: number;
  searchTerm?: string;
  tabFilter?: string; // 'todos', 'promocao', 'favoritos'
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  formId: string;
}

// Interfaces específicas para paginação do marketplace
export interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  // Props para o seletor de itens por página
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

// Props para o componente de controles da tabela marketplace
export interface MarketplaceTableControlsProps {
  // Search props
  searchTerm: string;
  onSearchChange: (value: string) => void;
  
  // Tab navigation props
  tabs: Array<{ id: string; label: string; icon?: ReactNode }>;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  
  // Filter props
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  
  // Country filter props
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  
  // Links filter props
  selectedLinks: string[];
  onLinksChange: (links: string[]) => void;
  
  // Niche filter props
  selectedNiches: string[];
  onNichesChange: (niches: string[]) => void;
  onNicheFilterChange?: (filterFn: (entry: any) => boolean) => void;
  
  // DA filter props
  onDAFilterChange: (filterFn: (entry: any) => boolean) => void;
  
  // Traffic filter props
  onTrafficFilterChange?: (filterFn: (entry: any) => boolean) => void;
  
  // Price filter props
  onPriceFilterChange?: (filterFn: (entry: any) => boolean) => void;
  
  // Data for counting entries
  entries?: any[];
  fields?: any[];
}

// Props para o seletor de itens por página específico do marketplace
export interface MarketplaceItemsPerPageProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  options?: number[];
}

export interface MarketplacePaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MarketplaceEntry {
  id: string;
  created_at: string;
  status: string;
  values: Record<string, any>;
}

export interface MarketplaceCounts {
  todos: number;
  promocao: number;
  favoritos: number;
}
