export interface PaginationParams {
  page: number;
  limit: number;
  searchTerm?: string;
  statusFilter?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  formId?: string;
}

export interface PaginatedResponse<T> {
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

export interface FormEntry {
  id: string;
  form_id: string;
  status: string;
  created_at: string;
  created_by: string | null;
  form: {
    title: string;
  };
  values: Record<string, any>;
  publisher?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  fields: any[];
  notes: {
    id: string;
    note: string;
    created_at: string;
    created_by: string | null;
  }[];
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  itemLabel?: string;
}

export interface PaginationInfoProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  itemLabel?: string;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface StatusCounts {
  todos: number;
  em_analise: number;
  verificado: number;
  reprovado: number;
}
