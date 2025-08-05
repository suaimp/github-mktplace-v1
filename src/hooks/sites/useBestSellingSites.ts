import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

interface BestSellingSiteFromTable {
  id: string;
  entry_id: string;
  product_name: string;
  product_url: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para gerenciar sites mais vendidos da nova tabela best_selling_sites
 */
export const useBestSellingSites = () => {
  const [sites, setSites] = useState<BestSellingSiteFromTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega todos os sites mais vendidos
   */
  const loadSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('best_selling_sites')
        .select('*')
        .order('quantity', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setSites(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao carregar sites mais vendidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega os sites na montagem do hook
   */
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  return {
    sites,
    loading,
    error,
    loadSites
  };
};
