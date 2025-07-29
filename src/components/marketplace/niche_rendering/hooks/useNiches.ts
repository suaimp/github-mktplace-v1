import { useState, useEffect } from "react";
import { nicheDataService } from "../services/nicheDataService";
import type { NicheOption } from "../types";

export function useNiches() {
  const [niches, setNiches] = useState<NicheOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNiches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allNiches = await nicheDataService.getAllNiches();
        
        if (isMounted) {
          setNiches(allNiches);
          setError(null);
        }
      } catch (err) {
        console.error("[useNiches] Error loading niches:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar nichos");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNiches();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    niches,
    loading,
    error,
    refetch: () => {
      nicheDataService.clearCache();
      setLoading(true);
      nicheDataService.getAllNiches().then(setNiches).finally(() => setLoading(false));
    }
  };
}
