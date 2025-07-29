export interface MarketplacePaginationParams {
  page: number;
  limit: number;
  searchTerm?: string;
  tabFilter?: string; // 'todos', 'promocao', 'favoritos'
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  formId: string;
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
