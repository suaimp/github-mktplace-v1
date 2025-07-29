import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import {
  parseNicheData,
  type NicheOption
} from "../../../services/db-services/form-services/formFieldNicheService";

// Cache global para os nichos
let globalNichesCache: NicheOption[] = [];
let globalNichesLoaded = false;
let globalNichesPromise: Promise<NicheOption[]> | null = null;

// Função para buscar todos os nichos disponíveis do banco de dados
async function loadAllAvailableNiches(): Promise<NicheOption[]> {
  // Se já temos cache, retorna imediatamente
  if (globalNichesLoaded && globalNichesCache.length > 0) {
    return globalNichesCache;
  }

  // Se já existe uma promise em andamento, reutiliza
  if (globalNichesPromise) {
    return globalNichesPromise;
  }

  // Cria uma nova promise
  globalNichesPromise = (async () => {
    try {
      console.log("[useNiches] Fetching niches from database...");

      const { data: nicheFields, error } = await supabase
        .from("form_field_niche")
        .select("options");

      if (error) {
        console.error("[useNiches] Error fetching niches:", error);
        return [];
      }

      const uniqueNiches = new Map<string, NicheOption>();

      // Processa todos os nichos de todos os campos
      nicheFields?.forEach((field) => {
        if (field.options && Array.isArray(field.options)) {
          const parsedNiches = parseNicheData(field.options);
          parsedNiches.forEach((niche) => {
            if (niche.text && niche.text.trim() !== "") {
              // Usa o texto como chave para evitar duplicatas
              uniqueNiches.set(niche.text, niche);
            }
          });
        }
      });

      globalNichesCache = Array.from(uniqueNiches.values());
      globalNichesLoaded = true;

      console.log("[useNiches] Loaded niches:", globalNichesCache);
      return globalNichesCache;
    } catch (error) {
      console.error("[useNiches] Error:", error);
      return [];
    } finally {
      globalNichesPromise = null;
    }
  })();

  return globalNichesPromise;
}

export function useNiches() {
  const [niches, setNiches] = useState<NicheOption[]>(globalNichesCache);
  const [loading, setLoading] = useState(!globalNichesLoaded);

  useEffect(() => {
    // Se já temos os dados no cache, não precisa buscar
    if (globalNichesLoaded && globalNichesCache.length > 0) {
      setNiches(globalNichesCache);
      setLoading(false);
      return;
    }

    // Busca os nichos
    loadAllAvailableNiches().then((fetchedNiches) => {
      setNiches(fetchedNiches);
      setLoading(false);
    });
  }, []);

  return { niches, loading };
}
