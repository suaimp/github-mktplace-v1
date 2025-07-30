/**
 * Validador de nichos
 * Responsabilidade única: Validar se valores de nicho são válidos
 */

import { NICHE_OPTIONS } from "../../constants/options";

export class NicheValidator {
  /**
   * Verifica se um valor de nicho é válido
   * @param value - Valor a ser validado
   * @returns boolean - true se válido, false caso contrário
   */
  static isValid(value: any): boolean {
    // Valores nulos/undefined são inválidos
    if (!value || value === null || value === undefined) {
      return false;
    }
    
    // Se é string, valida
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return this.isValidStringValue(trimmed);
    }
    
    return false;
  }

  /**
   * Verifica se um valor é "NO_SELECTION" interno
   */
  static isNoSelection(value: any): boolean {
    return value === NICHE_OPTIONS.NO_SELECTION;
  }

  /**
   * Verifica se uma string é um valor de nicho válido
   */
  private static isValidStringValue(value: string): boolean {
    return value !== '' && 
           value !== NICHE_OPTIONS.PLACEHOLDER && 
           value !== NICHE_OPTIONS.NO_SELECTION && 
           value !== 'null' && 
           value !== 'undefined';
  }

  /**
   * Verifica se um valor é o placeholder
   */
  static isPlaceholder(value: any): boolean {
    return value === NICHE_OPTIONS.PLACEHOLDER;
  }

  /**
   * Obtém lista de valores considerados inválidos
   */
  static getInvalidValues(): string[] {
    return [
      '',
      'null',
      'undefined',
      NICHE_OPTIONS.PLACEHOLDER,
      NICHE_OPTIONS.NO_SELECTION
    ];
  }
}
