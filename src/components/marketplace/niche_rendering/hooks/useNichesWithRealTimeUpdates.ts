import { useState, useEffect, useCallback } from "react";
import { nicheDataService } from "../services/nicheDataService";
import { nicheCacheManager } from "../services/nicheCacheManager";
import type { NicheOption } from "../types";

export function useNichesWithRealTimeUpdates() {
  const [niches, setNiches] = useState<NicheOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNiches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allNiches = await nicheDataService.getAllNiches();
      setNiches(allNiches);
      setError(null);
    } catch (err) {
      console.error("[useNichesWithRealTimeUpdates] Error loading niches:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar nichos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Carrega nichos inicialmente
    loadNiches();

    // Registra para receber invalidações de cache em tempo real
    const unsubscribe = nicheCacheManager.onCacheInvalidation(() => {
      if (isMounted) {
        console.log("[useNichesWithRealTimeUpdates] Cache invalidated, reloading niches");
        loadNiches();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadNiches]);

  return {
    niches,
    loading,
    error,
    refetch: loadNiches
  };
}
