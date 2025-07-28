import { supabase } from '../../../../../lib/supabase';

/**
 * Interface para os dados do logo
 */
export interface LogoData {
  light: string;
  dark: string;
  icon: string;
}

/**
 * Serviço responsável por obter os logos da plataforma
 */
export class LogoService {
  private static defaultLogos: LogoData = {
    light: "/images/logo/logo.svg",
    dark: "/images/logo/logo-dark.svg",
    icon: "/images/logo/logo-icon.svg"
  };

  /**
   * Obtém os logos da plataforma do banco de dados
   */
  static async getLogos(): Promise<LogoData> {
    try {
      console.log('🎨 [LogoService] Carregando logos do banco de dados...');

      const { data: settings } = await supabase
        .from('settings')
        .select('light_logo, dark_logo, platform_icon')
        .single();

      const logos = { ...this.defaultLogos };

      if (settings) {
        // Logo claro
        if (settings.light_logo) {
          const { data: lightUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.light_logo);
          if (lightUrl) logos.light = lightUrl.publicUrl;
        }

        // Logo escuro
        if (settings.dark_logo) {
          const { data: darkUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.dark_logo);
          if (darkUrl) logos.dark = darkUrl.publicUrl;
        }

        // Ícone da plataforma
        if (settings.platform_icon) {
          const { data: iconUrl } = supabase.storage
            .from('logos')
            .getPublicUrl(settings.platform_icon);
          if (iconUrl) logos.icon = iconUrl.publicUrl;
        }

        console.log('✅ [LogoService] Logos carregados:', {
          light: logos.light,
          dark: logos.dark,
          icon: logos.icon
        });
      } else {
        console.log('⚠️ [LogoService] Nenhuma configuração encontrada, usando logos padrão');
      }

      return logos;
    } catch (error) {
      console.error('❌ [LogoService] Erro ao carregar logos:', error);
      console.log('🔄 [LogoService] Retornando logos padrão como fallback');
      return this.defaultLogos;
    }
  }

  /**
   * Converte uma URL de imagem para base64 para uso no PDF
   */
  static async imageUrlToBase64(url: string): Promise<string | null> {
    try {
      console.log('🖼️ [LogoService] Convertendo imagem para base64:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ [LogoService] Erro ao converter imagem:', error);
      return null;
    }
  }

  /**
   * Obtém o logo em base64 pronto para uso no PDF
   */
  static async getLogoForPdf(preferDark: boolean = false): Promise<string | null> {
    try {
      const logos = await this.getLogos();
      const logoUrl = preferDark ? logos.dark : logos.light;
      
      console.log('📄 [LogoService] Preparando logo para PDF:', logoUrl);
      
      return await this.imageUrlToBase64(logoUrl);
    } catch (error) {
      console.error('❌ [LogoService] Erro ao preparar logo para PDF:', error);
      return null;
    }
  }
}
