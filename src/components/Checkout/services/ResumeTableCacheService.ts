import { getCartCheckoutResumeByUser } from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";

/**
 * Cache simples para dados da tabela de resumo
 */
interface CacheEntry {
  data: any[];
  timestamp: number;
  userId: string;
}

class ResumeTableCacheService {
  private static instance: ResumeTableCacheService;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 30000; // 30 segundos

  static getInstance(): ResumeTableCacheService {
    if (!ResumeTableCacheService.instance) {
      ResumeTableCacheService.instance = new ResumeTableCacheService();
    }
    return ResumeTableCacheService.instance;
  }

  /**
   * Busca dados do cache se disponível e válido, senão busca do banco
   */
  async getData(userId: string, forceRefresh = false): Promise<any[]> {
    const cacheKey = `resume_data_${userId}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Verifica se tem cache válido e não é refresh forçado
    if (!forceRefresh && cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log('✅ [ResumeTableCacheService] Retornando dados do cache');
      return cached.data;
    }

    console.log('🔍 [ResumeTableCacheService] Buscando dados do banco de dados...');
    
    try {
      const data = await getCartCheckoutResumeByUser(userId);
      const resumeData = data || [];

      // Atualiza o cache
      this.cache.set(cacheKey, {
        data: resumeData,
        timestamp: now,
        userId
      });

      console.log('✅ [ResumeTableCacheService] Dados carregados do banco e cache atualizado');
      return resumeData;
    } catch (error) {
      console.error('❌ [ResumeTableCacheService] Erro ao buscar dados:', error);
      
      // Se falhar e tiver cache (mesmo expirado), retorna o cache
      if (cached) {
        console.log('⚠️ [ResumeTableCacheService] Retornando cache expirado devido ao erro');
        return cached.data;
      }
      
      return [];
    }
  }

  /**
   * Invalida o cache para um usuário específico
   */
  invalidateCache(userId: string): void {
    const cacheKey = `resume_data_${userId}`;
    this.cache.delete(cacheKey);
    console.log('🗑️ [ResumeTableCacheService] Cache invalidado para usuário:', userId);
  }

  /**
   * Invalida todo o cache
   */
  invalidateAllCache(): void {
    this.cache.clear();
    console.log('🗑️ [ResumeTableCacheService] Todo o cache foi invalidado');
  }

  /**
   * Retorna informações do cache para debugging
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default ResumeTableCacheService;
