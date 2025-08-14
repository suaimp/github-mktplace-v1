/**
 * Serviço para buscar configurações da plataforma
 * Usado para obter dados dinâmicos como nome da plataforma nos emails
 */

import { supabase } from '../../lib/supabase';

export interface PlatformSettings {
  site_title: string;
  site_description: string;
}

export class SettingsService {
  /**
   * Busca as configurações da plataforma para uso nos emails
   */
  static async getPlatformSettings(): Promise<PlatformSettings> {
    try {
      console.log('⚙️ [SettingsService] Buscando configurações da plataforma...');

      const { data, error } = await supabase
        .from('settings')
        .select('site_title, site_description')
        .single();

      if (error) {
        console.warn('⚠️ [SettingsService] Erro ao buscar configurações, usando padrão:', error);
        return this.getDefaultSettings();
      }

      const settings = {
        site_title: data.site_title || 'Marketplace Sua Imprensa',
        site_description: data.site_description || 'Plataforma de marketplace para conectar publishers e anunciantes'
      };

      console.log('✅ [SettingsService] Configurações carregadas:', settings);
      return settings;
    } catch (error) {
      console.error('❌ [SettingsService] Erro ao buscar configurações:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Retorna configurações padrão como fallback
   */
  private static getDefaultSettings(): PlatformSettings {
    const defaultSettings = {
      site_title: 'Marketplace Sua Imprensa',
      site_description: 'Plataforma de marketplace para conectar publishers e anunciantes'
    };

    console.log('🔄 [SettingsService] Usando configurações padrão:', defaultSettings);
    return defaultSettings;
  }

  /**
   * Cache simples das configurações (opcional para performance)
   */
  private static cachedSettings: PlatformSettings | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Busca configurações com cache simples
   */
  static async getPlatformSettingsWithCache(): Promise<PlatformSettings> {
    const now = Date.now();
    
    // Se tem cache válido, usar
    if (this.cachedSettings && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('💾 [SettingsService] Usando configurações do cache');
      return this.cachedSettings;
    }

    // Buscar novas configurações
    const settings = await this.getPlatformSettings();
    
    // Atualizar cache
    this.cachedSettings = settings;
    this.cacheTimestamp = now;
    
    return settings;
  }
}
