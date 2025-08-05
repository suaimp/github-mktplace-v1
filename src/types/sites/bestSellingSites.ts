/**
 * Interface para a tabela best_selling_sites do banco de dados
 */
export interface BestSellingSite {
  id: string;
  entry_id: string;
  sales_count: number;
  total_revenue: number;
  url: string;
  price: number;
  last_sale_date?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para exibição de sites mais vendidos na UI
 */
export interface BestSellingSiteDisplay {
  id: string;
  url: string;
  sales_count: number;
  total_revenue: number;
  price: number;
  last_sale_date?: string;
}

/**
 * Interface para ranking de sites mais vendidos
 */
export interface BestSellingSiteRanking {
  id: string;
  url: string;
  sales_count: number;
  total_revenue: number;
  ranking_position: number;
}

/**
 * Interface para criação de um novo site mais vendido
 */
export interface CreateBestSellingSiteRequest {
  entry_id: string;
  url: string;
  price: number;
  sales_count?: number;
  total_revenue?: number;
}

/**
 * Interface para atualização de um site mais vendido
 */
export interface UpdateBestSellingSiteRequest {
  sales_count?: number;
  total_revenue?: number;
  price?: number;
  last_sale_date?: string;
}

/**
 * Interface para estatísticas dos sites mais vendidos
 */
export interface BestSellingSitesStats {
  total_sites: number;
  total_sales: number;
  total_revenue: number;
  average_sales_per_site: number;
  average_revenue_per_site: number;
}

/**
 * Interface para filtros de busca de sites mais vendidos
 */
export interface BestSellingSitesFilters {
  minSalesCount?: number;
  maxSalesCount?: number;
  minRevenue?: number;
  maxRevenue?: number;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Interface para parâmetros de paginação
 */
export interface BestSellingSitesPagination {
  page: number;
  limit: number;
  orderBy?: 'sales_count' | 'total_revenue' | 'price' | 'created_at';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Interface para resposta paginada de sites mais vendidos
 */
export interface BestSellingSitesPaginatedResponse {
  data: BestSellingSiteDisplay[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
