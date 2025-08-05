import { supabase } from "../../../../lib/supabase";

type CacheInvalidationCallback = () => void;

class NicheCacheManager {
  private static instance: NicheCacheManager;
  private callbacks: Set<CacheInvalidationCallback> = new Set();
  private realtimeChannel: any = null;
  private isListening = false;

  static getInstance(): NicheCacheManager {
    if (!NicheCacheManager.instance) {
      NicheCacheManager.instance = new NicheCacheManager();
    }
    return NicheCacheManager.instance;
  }

  // Registra um callback para ser chamado quando o cache deve ser invalidado
  onCacheInvalidation(callback: CacheInvalidationCallback): () => void {
    this.callbacks.add(callback);
    this.startListening();

    // Retorna função de cleanup
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stopListening();
      }
    };
  }

  // Inicia o listener de mudanças na tabela form_field_niche
  private startListening(): void {
    if (this.isListening || this.realtimeChannel) {
      return;
    }

    this.realtimeChannel = supabase
      .channel('form_field_niche_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'form_field_niche'
        },
        () => {
          this.invalidateCache();
        }
      )
      .subscribe();

    this.isListening = true;
  }

  // Para o listener
  private stopListening(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.isListening = false;
  }

  // Invalidate o cache notificando todos os callbacks
  private invalidateCache(): void {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error("[NicheCacheManager] Error in cache invalidation callback:", error);
      }
    });
  }

  // Método público para invalidação manual do cache
  manualInvalidate(): void {
    this.invalidateCache();
  }

  // Cleanup completo (útil para testes ou unmount da aplicação)
  destroy(): void {
    this.stopListening();
    this.callbacks.clear();
  }
}

export const nicheCacheManager = NicheCacheManager.getInstance();
