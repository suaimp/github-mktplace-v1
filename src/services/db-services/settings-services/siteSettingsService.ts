import { supabase } from "../../../lib/supabase";

export interface SiteSettings {
  id: string;
  site_title: string | null;
  site_description: string | null;
  light_logo: string | null;
  dark_logo: string | null;
  platform_icon: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_from_email: string | null;
  smtp_from_name: string | null;
  header_scripts: string | null;
  footer_scripts: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SiteMetaData {
  site_title: string;
  site_description: string;
}

export class SiteSettingsService {
  /**
   * Busca as configurações completas do site
   */
  static async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        // Se não existe configuração, cria uma nova
        if (error.code === 'PGRST116') {
          return await this.createInitialSettings();
        }
        throw error;
      }

      return data as SiteSettings;
    } catch (error) {
      console.error('Erro ao buscar configurações do site:', error);
      return null;
    }
  }

  /**
   * Atualiza apenas os metadados do site (título e descrição)
   */
  static async updateSiteMetaData(metaData: SiteMetaData): Promise<boolean> {
    try {
      const settings = await this.getSiteSettings();
      if (!settings) {
        throw new Error('Configurações não encontradas');
      }

      const { error } = await supabase
        .from('settings')
        .update({
          site_title: metaData.site_title.trim(),
          site_description: metaData.site_description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao atualizar metadados do site:', error);
      return false;
    }
  }

  /**
   * Busca apenas os metadados do site
   */
  static async getSiteMetaData(): Promise<SiteMetaData | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('site_title, site_description')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await this.createInitialSettings();
          return {
            site_title: 'Marketplace Platform',
            site_description: 'Plataforma de marketplace para conectar publishers e anunciantes'
          };
        }
        throw error;
      }

      return {
        site_title: data.site_title || 'Marketplace Platform',
        site_description: data.site_description || 'Plataforma de marketplace para conectar publishers e anunciantes'
      };
    } catch (error) {
      console.error('Erro ao buscar metadados do site:', error);
      return null;
    }
  }

  /**
   * Cria configurações iniciais se não existirem
   */
  private static async createInitialSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from('settings')
      .insert([{
        site_title: 'Marketplace Platform',
        site_description: 'Plataforma de marketplace para conectar publishers e anunciantes'
      }])
      .select()
      .single();

    if (error) throw error;
    return data as SiteSettings;
  }

  /**
   * Valida os dados de metadados
   */
  static validateSiteMetaData(metaData: Partial<SiteMetaData>): string[] {
    const errors: string[] = [];

    if (!metaData.site_title || metaData.site_title.trim().length === 0) {
      errors.push('Título do site é obrigatório');
    }

    if (metaData.site_title && metaData.site_title.trim().length > 100) {
      errors.push('Título do site deve ter no máximo 100 caracteres');
    }

    if (!metaData.site_description || metaData.site_description.trim().length === 0) {
      errors.push('Descrição do site é obrigatória');
    }

    if (metaData.site_description && metaData.site_description.trim().length > 300) {
      errors.push('Descrição do site deve ter no máximo 300 caracteres');
    }

    return errors;
  }
}
