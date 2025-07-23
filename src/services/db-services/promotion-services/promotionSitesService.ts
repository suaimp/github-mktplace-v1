import { supabase } from "../../../lib/supabase";

export interface PromotionSite {
  id: string;
  entry_id: string;
  percent: number;
  price: number;
  old_price: number;
  promotional_price: number;
  old_promotional_price: number;
  url: string;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionSiteDisplay {
  id: string;
  url: string;
  percent: number;
  price: number;
  promotional_price: number;
}

export class PromotionSitesService {
  /**
   * Busca todos os sites em promoção ordenados por maior desconto
   */
  static async getAllPromotionSites(): Promise<PromotionSite[] | null> {
    try {
      const { data, error } = await supabase
        .from('promotion_sites')
        .select('*')
        .order('percent', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sites em promoção:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar sites em promoção:', error);
      return null;
    }
  }

  /**
   * Busca sites em promoção formatados para exibição no ranking
   */
  static async getPromotionSitesForRanking(): Promise<PromotionSiteDisplay[] | null> {
    try {
      const sites = await this.getAllPromotionSites();
      
      if (!sites) {
        return null;
      }

      // Mapeia os dados para o formato de exibição
      const displaySites: PromotionSiteDisplay[] = sites.map(site => ({
        id: site.id,
        url: site.url,
        percent: site.percent,
        price: site.price,
        promotional_price: site.promotional_price
      }));

      return displaySites;
    } catch (error) {
      console.error('Erro ao formatar sites em promoção para ranking:', error);
      return null;
    }
  }

  /**
   * Busca sites em promoção com limite para o ranking
   */
  static async getTopPromotionSites(limit: number = 10): Promise<PromotionSiteDisplay[] | null> {
    try {
      const { data, error } = await supabase
        .from('promotion_sites')
        .select('id, url, percent, price, promotional_price')
        .order('percent', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar top sites em promoção:', error);
        return null;
      }

      return data as PromotionSiteDisplay[];
    } catch (error) {
      console.error('Erro inesperado ao buscar top sites em promoção:', error);
      return null;
    }
  }

  /**
   * Busca um site em promoção específico por ID
   */
  static async getPromotionSiteById(id: string): Promise<PromotionSite | null> {
    try {
      const { data, error } = await supabase
        .from('promotion_sites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar site em promoção por ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar site em promoção por ID:', error);
      return null;
    }
  }

  /**
   * Extrai o domínio de uma URL para exibição mais limpa
   */
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Formata a porcentagem de desconto para exibição
   */
  static formatPercent(percent: number): string {
    return `${percent.toFixed(1)}%`;
  }
}
