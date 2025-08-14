import { AdminService } from '../services/auth/AdminService';

/**
 * Utilitários para verificações relacionadas a admin
 * Princípio da Responsabilidade Única: Apenas funções utilitárias para admin
 */
export class AdminUtils {
  /**
   * Verifica se um usuário é admin de forma síncrona (para componentes)
   * Usa cache se disponível
   */
  private static adminCache = new Map<string, { result: boolean; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Verifica admin com cache para melhor performance
   */
  static async isAdminWithCache(userId: string): Promise<boolean> {
    const cached = this.adminCache.get(userId);
    const now = Date.now();

    // Verifica se o cache ainda é válido
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.result;
    }

    // Busca novo resultado
    const result = await AdminService.isUserAdmin(userId);
    
    // Atualiza o cache
    this.adminCache.set(userId, { result, timestamp: now });
    
    return result;
  }

  /**
   * Limpa o cache de admin para um usuário específico
   */
  static clearAdminCache(userId?: string): void {
    if (userId) {
      this.adminCache.delete(userId);
    } else {
      this.adminCache.clear();
    }
  }

  /**
   * Verifica se o cache contém informações de admin para um usuário
   */
  static hasAdminCache(userId: string): boolean {
    const cached = this.adminCache.get(userId);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.CACHE_DURATION;
  }
}
