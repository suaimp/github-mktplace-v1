/**
 * Validador de serviços
 * Responsabilidade única: Validar se valores de serviço são válidos
 */

import { SERVICE_OPTIONS } from "../../constants/options";

export class ServiceValidator {
  /**
   * Verifica se um valor de serviço é válido
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
   * Verifica se uma string é um valor de serviço válido
   */
  private static isValidStringValue(value: string): boolean {
    return value !== '' && 
           value !== SERVICE_OPTIONS.PLACEHOLDER && 
           value !== SERVICE_OPTIONS.NO_SELECTION &&
           value !== 'null' && 
           value !== 'undefined';
  }

  /**
   * Verifica se um valor é o placeholder
   */
  static isPlaceholder(value: any): boolean {
    return value === SERVICE_OPTIONS.PLACEHOLDER;
  }

  /**
   * Verifica se um valor é "NO_SELECTION" interno
   */
  static isNoSelection(value: any): boolean {
    return value === SERVICE_OPTIONS.NO_SELECTION;
  }

  /**
   * Verifica se é uma opção "Nenhum" válida (seleção consciente do usuário)
   */
  static isValidNoneOption(value: any): boolean {
    return value === SERVICE_OPTIONS.NONE || value === SERVICE_OPTIONS.LEGACY_NONE;
  }

  /**
   * Obtém lista de valores considerados inválidos
   */
  static getInvalidValues(): string[] {
    return [
      '',
      'null',
      'undefined',
      SERVICE_OPTIONS.PLACEHOLDER,
      SERVICE_OPTIONS.NO_SELECTION
    ];
  }
}
