import { supabase } from "../../../../lib/supabase";

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

export interface BestSellingSiteDisplay {
  id: string;
  url: string;
  sales_count: number;
  total_revenue: number;
  price: number;
  last_sale_date?: string;
}

export interface BestSellingSiteRanking {
  id: string;
  url: string;
  sales_count: number;
  total_revenue: number;
  ranking_position: number;
}

export interface CreateBestSellingSiteRequest {
  entry_id: string;
  url: string;
  price: number;
  sales_count?: number;
  total_revenue?: number;
}

export interface UpdateBestSellingSiteRequest {
  sales_count?: number;
  total_revenue?: number;
  price?: number;
  last_sale_date?: string;
}

export class BestSellingSitesService {
  /**
   * Busca todos os sites mais vendidos ordenados por quantidade de vendas
   */
  static async getAllBestSellingSites(): Promise<BestSellingSite[] | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('*')
        .order('sales_count', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sites mais vendidos:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar sites mais vendidos:', error);
      return null;
    }
  }

  /**
   * Busca sites mais vendidos formatados para exibição no ranking
   */
  static async getBestSellingSitesForRanking(): Promise<BestSellingSiteRanking[] | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('id, url, sales_count, total_revenue')
        .order('sales_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar ranking de sites mais vendidos:', error);
        return null;
      }

      return data?.map((site, index) => ({
        ...site,
        ranking_position: index + 1
      })) || null;
    } catch (error) {
      console.error('Erro inesperado ao buscar ranking de sites mais vendidos:', error);
      return null;
    }
  }

  /**
   * Busca sites mais vendidos formatados para exibição
   */
  static async getBestSellingSitesForDisplay(): Promise<BestSellingSiteDisplay[] | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('id, url, sales_count, total_revenue, price, last_sale_date')
        .order('sales_count', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sites mais vendidos para exibição:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar sites mais vendidos para exibição:', error);
      return null;
    }
  }

  /**
   * Busca um site mais vendido por ID
   */
  static async getBestSellingSiteById(id: string): Promise<BestSellingSite | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar site mais vendido por ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar site mais vendido por ID:', error);
      return null;
    }
  }

  /**
   * Busca um site mais vendido por entry_id
   */
  static async getBestSellingSiteByEntryId(entryId: string): Promise<BestSellingSite | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('*')
        .eq('entry_id', entryId)
        .single();

      if (error) {
        console.error('Erro ao buscar site mais vendido por entry_id:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar site mais vendido por entry_id:', error);
      return null;
    }
  }

  /**
   * Cria um novo registro de site mais vendido
   */
  static async createBestSellingSite(request: CreateBestSellingSiteRequest): Promise<BestSellingSite | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .insert({
          entry_id: request.entry_id,
          url: request.url,
          price: request.price,
          sales_count: request.sales_count || 0,
          total_revenue: request.total_revenue || 0
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar site mais vendido:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao criar site mais vendido:', error);
      return null;
    }
  }

  /**
   * Atualiza um site mais vendido
   */
  static async updateBestSellingSite(id: string, request: UpdateBestSellingSiteRequest): Promise<BestSellingSite | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .update(request)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar site mais vendido:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao atualizar site mais vendido:', error);
      return null;
    }
  }

  /**
   * Incrementa o contador de vendas e atualiza o total de receita
   */
  static async incrementSalesCount(id: string, saleAmount: number): Promise<BestSellingSite | null> {
    try {
      const { error } = await supabase.rpc('increment_best_selling_site_sales', {
        site_id: id,
        sale_amount: saleAmount
      });

      if (error) {
        console.error('Erro ao incrementar vendas do site:', error);
        return null;
      }

      // Busca o registro atualizado
      return await this.getBestSellingSiteById(id);
    } catch (error) {
      console.error('Erro inesperado ao incrementar vendas do site:', error);
      return null;
    }
  }

  /**
   * Remove um site mais vendido
   */
  static async deleteBestSellingSite(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('best_selling_sites')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover site mais vendido:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao remover site mais vendido:', error);
      return false;
    }
  }

  /**
   * Busca top N sites mais vendidos
   */
  static async getTopBestSellingSites(limit: number = 10): Promise<BestSellingSiteDisplay[] | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('id, url, sales_count, total_revenue, price, last_sale_date')
        .order('sales_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar top sites mais vendidos:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar top sites mais vendidos:', error);
      return null;
    }
  }

  /**
   * Busca sites mais vendidos por faixa de receita
   */
  static async getBestSellingSitesByRevenueRange(minRevenue: number, maxRevenue: number): Promise<BestSellingSite[] | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('*')
        .gte('total_revenue', minRevenue)
        .lte('total_revenue', maxRevenue)
        .order('total_revenue', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sites por faixa de receita:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar sites por faixa de receita:', error);
      return null;
    }
  }

  /**
   * Busca estatísticas gerais dos sites mais vendidos
   */
  static async getBestSellingSitesStats(): Promise<{
    total_sites: number;
    total_sales: number;
    total_revenue: number;
    average_sales_per_site: number;
    average_revenue_per_site: number;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('get_best_selling_sites_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas dos sites mais vendidos:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar estatísticas dos sites mais vendidos:', error);
      return null;
    }
  }
}
