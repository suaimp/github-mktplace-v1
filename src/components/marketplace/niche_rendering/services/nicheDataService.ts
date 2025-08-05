import { supabase } from "../../../../lib/supabase";
import { parseNicheData } from "../../../../services/db-services/form-services/formFieldNicheService";
import type { NicheOption } from "../types";
import { nicheCacheManager } from "./nicheCacheManager";

class NicheDataService {
  private static instance: NicheDataService;
  private cache: NicheOption[] = [];
  private isLoaded = false;
  private loadingPromise: Promise<NicheOption[]> | null = null;
  private cacheCleanupFunction: (() => void) | null = null;

  static getInstance(): NicheDataService {
    if (!NicheDataService.instance) {
      NicheDataService.instance = new NicheDataService();
    }
    return NicheDataService.instance;
  }

  constructor() {
    // Registra para invalidação automática do cache
    this.cacheCleanupFunction = nicheCacheManager.onCacheInvalidation(() => {
      this.clearCache();
    });
  }

  async getAllNiches(): Promise<NicheOption[]> {
    // Se já está carregado, retorna o cache
    if (this.isLoaded && this.cache.length > 0) {
      return this.cache;
    }

    // Se já está carregando, retorna a mesma promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Inicia o carregamento
    this.loadingPromise = this.loadNichesFromDatabase();
    
    try {
      const result = await this.loadingPromise;
      this.cache = result;
      this.isLoaded = true;
      return result;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async loadNichesFromDatabase(): Promise<NicheOption[]> {
    try {
      const { data: nicheFields, error } = await supabase
        .from("form_field_niche")
        .select("options");

      if (error) {
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

      const result = Array.from(uniqueNiches.values());
      
      return result;
    } catch (error) {
      console.error("[NicheDataService] Error loading niches:", error);
      return [];
    }
  }

  // Método para limpar o cache se necessário
  clearCache(): void {
    this.cache = [];
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  // Cleanup completo incluindo listeners
  destroy(): void {
    this.clearCache();
    if (this.cacheCleanupFunction) {
      this.cacheCleanupFunction();
      this.cacheCleanupFunction = null;
    }
  }
}

export const nicheDataService = NicheDataService.getInstance();
