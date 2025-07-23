import { useState, useEffect } from 'react';
import { PromotionSitesService, PromotionSiteDisplay } from '../../../../services/db-services/promotion-services/promotionSitesService';

export interface UsePromotionSitesReturn {
  sites: PromotionSiteDisplay[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePromotionSites(limit: number = 10): UsePromotionSitesReturn {
  const [sites, setSites] = useState<PromotionSiteDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await PromotionSitesService.getTopPromotionSites(limit);
      
      if (data === null) {
        setError('Erro ao carregar sites em promoção');
        setSites([]);
      } else {
        setSites(data);
      }
    } catch (err) {
      console.error('Erro no hook usePromotionSites:', err);
      setError('Erro inesperado ao carregar dados');
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [limit]);

  const refetch = async () => {
    await fetchSites();
  };

  return {
    sites,
    loading,
    error,
    refetch
  };
}
