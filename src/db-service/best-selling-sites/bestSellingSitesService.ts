import { supabase } from "../../lib/supabase";

export interface BestSellingSite {
  id: string;
  entry_id: string;
  product_url: string;
  product_name: string;
  quantity: number;
  created_at: string;
}

/**
 * Serviço responsável por operações na tabela best_selling_sites
 * Segue o princípio de responsabilidade única
 */
export class BestSellingSitesService {
  /**
   * Busca os melhores sites vendidos com limite
   */
  static async getBestSellingSites(limit: number = 10): Promise<BestSellingSite[]> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('*')
        .order('quantity', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('BestSellingSitesService - Erro ao buscar sites:', error);
        throw new Error(error.message || 'Erro ao carregar sites');
      }

      return data || [];
    } catch (error) {
      console.error('BestSellingSitesService - Erro inesperado:', error);
      throw error;
    }
  }

  /**
   * Busca um site específico por entry_id
   */
  static async getSiteByEntryId(entryId: string): Promise<BestSellingSite | null> {
    try {
      const { data, error } = await supabase
        .from('best_selling_sites')
        .select('*')
        .eq('entry_id', entryId)
        .single();

      if (error) {
        console.error('BestSellingSitesService - Erro ao buscar site por entry_id:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('BestSellingSitesService - Erro inesperado ao buscar por entry_id:', error);
      return null;
    }
  }
}
