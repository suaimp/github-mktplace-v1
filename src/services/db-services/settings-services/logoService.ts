import { supabase } from "../../../lib/supabase";

export interface LogoUploadData {
  light_logo?: string;
  dark_logo?: string;
  platform_icon?: string;
}

export interface LogoFile {
  file: File;
  type: 'light' | 'dark' | 'icon';
}

export class LogoService {
  /**
   * Faz upload de um arquivo de logo para o Supabase Storage
   */
  static async uploadLogo(logoFile: LogoFile): Promise<string> {
    const { file, type } = logoFile;
    
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `${type}-logo-${Date.now()}${fileExtension}`;
    
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Erro ao fazer upload do ${type} logo: ${uploadError.message}`);
    }

    return fileName;
  }

  /**
   * Faz upload de múltiplos logos
   */
  static async uploadMultipleLogos(logoFiles: LogoFile[]): Promise<LogoUploadData> {
    const uploads: LogoUploadData = {};

    for (const logoFile of logoFiles) {
      try {
        const fileName = await this.uploadLogo(logoFile);
        
        switch (logoFile.type) {
          case 'light':
            uploads.light_logo = fileName;
            break;
          case 'dark':
            uploads.dark_logo = fileName;
            break;
          case 'icon':
            uploads.platform_icon = fileName;
            break;
        }
      } catch (error) {
        console.error(`Erro ao fazer upload do logo ${logoFile.type}:`, error);
        throw error;
      }
    }

    return uploads;
  }

  /**
   * Atualiza os logos no banco de dados
   */
  static async updateLogosInDatabase(settingsId: string, logoData: LogoUploadData): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .update(logoData)
      .eq('id', settingsId);

    if (error) {
      throw new Error(`Erro ao atualizar logos no banco: ${error.message}`);
    }
  }

  /**
   * Valida se um arquivo é um logo válido
   */
  static validateLogoFile(file: File, type: 'light' | 'dark' | 'icon'): string[] {
    const errors: string[] = [];

    // Validar tamanho do arquivo (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push(`${type} logo deve ter no máximo 5MB`);
    }

    // Validar tipo de arquivo
    const allowedTypes = type === 'icon' 
      ? ['image/png']
      : ['image/svg+xml', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      const allowedString = type === 'icon' ? 'PNG' : 'SVG ou PNG';
      errors.push(`${type} logo deve ser um arquivo ${allowedString}`);
    }

    return errors;
  }

  /**
   * Valida múltiplos arquivos de logo
   */
  static validateMultipleLogos(logoFiles: LogoFile[]): string[] {
    const errors: string[] = [];

    for (const logoFile of logoFiles) {
      const fileErrors = this.validateLogoFile(logoFile.file, logoFile.type);
      errors.push(...fileErrors);
    }

    return errors;
  }
}
