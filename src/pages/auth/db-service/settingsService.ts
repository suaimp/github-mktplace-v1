// src/pages/auth/db-service/settingsService.ts

import { supabase } from "../../../lib/supabase";
import { SiteSettings } from "../types/settings";

export class SettingsService {
  static async getSiteDescription(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('site_description')
        .single();

      if (error) {
        console.error('Erro ao buscar descrição do site:', error);
        return 'Sistema de Gestão Administrativa'; // Fallback
      }

      return data?.site_description || 'Sistema de Gestão Administrativa';
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      return 'Sistema de Gestão Administrativa'; // Fallback
    }
  }

  static async getAllSettings(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao buscar configurações:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      return null;
    }
  }
}
