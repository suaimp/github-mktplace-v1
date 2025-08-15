import { supabase } from "../../../lib/supabase";

/**
 * Interface para configurações de scripts de header e footer
 */
export interface HeaderFooterScripts {
  header_scripts: string | null;
  footer_scripts: string | null;
}

/**
 * Interface para dados do formulário de header/footer
 */
export interface HeaderFooterFormData {
  header_scripts: string;
  footer_scripts: string;
}

/**
 * Interface para validação de scripts
 */
export interface ScriptValidationResult {
  isValid: boolean;
  errors: {
    header_scripts?: string;
    footer_scripts?: string;
  };
}

/**
 * Serviço responsável pelo gerenciamento de scripts de header e footer
 * Segue o princípio de responsabilidade única
 */
export class HeaderFooterScriptsService {
  /**
   * Busca as configurações de scripts do header e footer
   */
  static async getHeaderFooterScripts(): Promise<HeaderFooterScripts | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('header_scripts, footer_scripts')
        .single();

      if (error) {
        console.error('Erro ao buscar scripts de header/footer:', error);
        return null;
      }

      return data as HeaderFooterScripts;
    } catch (error) {
      console.error('Erro inesperado ao buscar scripts:', error);
      return null;
    }
  }

  /**
   * Atualiza as configurações de scripts do header e footer
   */
  static async updateHeaderFooterScripts(
    settingsId: string,
    scripts: HeaderFooterFormData
  ): Promise<boolean> {
    try {
      // Validar scripts antes de salvar
      const validation = this.validateScripts(scripts);
      if (!validation.isValid) {
        throw new Error('Scripts inválidos: ' + Object.values(validation.errors).join(', '));
      }

      const { error } = await supabase
        .from('settings')
        .update({
          header_scripts: scripts.header_scripts?.trim() || null,
          footer_scripts: scripts.footer_scripts?.trim() || null,
        })
        .eq('id', settingsId);

      if (error) {
        console.error('Erro ao atualizar scripts:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar scripts:', error);
      return false;
    }
  }

  /**
   * Valida os scripts de header e footer
   */
  static validateScripts(scripts: HeaderFooterFormData): ScriptValidationResult {
    const errors: ScriptValidationResult['errors'] = {};
    let isValid = true;

    // Validação básica de tamanho
    if (scripts.header_scripts && scripts.header_scripts.length > 10000) {
      errors.header_scripts = 'Scripts do header não podem exceder 10.000 caracteres';
      isValid = false;
    }

    if (scripts.footer_scripts && scripts.footer_scripts.length > 10000) {
      errors.footer_scripts = 'Scripts do footer não podem exceder 10.000 caracteres';
      isValid = false;
    }

    // Validação de segurança básica (detecção de scripts maliciosos)
    const dangerousPatterns = [
      /document\.write/gi,
      /eval\s*\(/gi,
      /innerHTML\s*=/gi,
      /javascript:\s*void/gi,
      /on(load|error|click|focus)\s*=/gi
    ];

    const checkDangerousPatterns = (script: string, fieldName: string) => {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(script)) {
          errors[fieldName as keyof ScriptValidationResult['errors']] = 
            `Script contém padrões potencialmente perigosos em ${fieldName}`;
          isValid = false;
          break;
        }
      }
    };

    if (scripts.header_scripts) {
      checkDangerousPatterns(scripts.header_scripts, 'header_scripts');
    }

    if (scripts.footer_scripts) {
      checkDangerousPatterns(scripts.footer_scripts, 'footer_scripts');
    }

    return { isValid, errors };
  }

  /**
   * Sanitiza scripts removendo elementos potencialmente perigosos
   */
  static sanitizeScript(script: string): string {
    if (!script) return '';

    // Remove comentários HTML maliciosos
    let sanitized = script.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove quebras de linha desnecessárias no início e fim
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Verifica se um script contém tags válidas de HTML/JavaScript
   */
  static isValidScriptFormat(script: string): boolean {
    if (!script || script.trim() === '') return true;

    // Verifica se contém tags HTML válidas ou JavaScript
    const validPatterns = [
      /<script[\s\S]*?<\/script>/gi,
      /<meta[\s\S]*?\/?>/gi,
      /<link[\s\S]*?\/?>/gi,
      /<style[\s\S]*?<\/style>/gi,
      /gtag\(/gi,
      /ga\(/gi,
      /fbq\(/gi
    ];

    return validPatterns.some(pattern => pattern.test(script));
  }
}
