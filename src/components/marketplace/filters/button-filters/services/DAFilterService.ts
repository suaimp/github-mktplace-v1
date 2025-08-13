/**
 * Serviço para filtro de DA (Domain Authority)
 * Responsabilidade: Lógica de negócio para filtros de range de DA
 */

import { RangeOption, CustomRange, RangeFilterState } from '../components/base/types/RangeFilterTypes';
import { ClassificationColorService } from '../../../services/ClassificationColorService';

export class DAFilterService {
  
  /**
   * Gera as opções de classificação de DA baseadas nas regras definidas
   * Agora com suporte ao dark mode
   */
  static generateDAFilterOptions(isDarkMode: boolean = false): RangeOption[] {
    return ClassificationColorService.getAllClassifications(isDarkMode);
  }

  /**
   * Verifica se um valor de DA está dentro das opções selecionadas
   */
  static isDAValueSelected(
    daValue: number, 
    selectedRanges: string[], 
    customRange: CustomRange,
    options: RangeOption[]
  ): boolean {
    // Verifica ranges predefinidos
    for (const rangeId of selectedRanges) {
      const option = options.find(opt => opt.id === rangeId);
      if (option && daValue >= option.minValue && daValue <= option.maxValue) {
        return true;
      }
    }

    // Verifica range customizado
    if (customRange.min !== null || customRange.max !== null) {
      const minCheck = customRange.min === null || daValue >= customRange.min;
      const maxCheck = customRange.max === null || daValue <= customRange.max;
      return minCheck && maxCheck;
    }

    return false;
  }

  /**
   * Conta quantos itens existem para cada classificação
   */
  static countItemsByClassification(
    data: any[], 
    daFieldName: string,
    options: RangeOption[]
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    // Inicializa contadores
    options.forEach(option => {
      counts[option.id] = 0;
    });

    // Conta os itens
    data.forEach(item => {
      const daValue = this.extractDAValue(item[daFieldName]);
      if (daValue !== null) {
        const classification = this.getDAClassification(daValue, options);
        if (classification) {
          counts[classification]++;
        }
      }
    });

    return counts;
  }

  /**
   * Extrai o valor numérico de DA de diferentes formatos
   */
  static extractDAValue(value: any): number | null {
    if (value === null || value === undefined) return null;
    
    // Se já é número
    if (typeof value === 'number') return value;
    
    // Se é string, tenta converter
    if (typeof value === 'string') {
      // Remove vírgulas e converte
      const cleaned = value.replace(/,/g, '');
      const parsed = parseInt(cleaned, 10);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }

  /**
   * Determina a classificação de um valor de DA
   */
  static getDAClassification(daValue: number, options: RangeOption[]): string | null {
    for (const option of options) {
      if (daValue >= option.minValue && daValue <= option.maxValue) {
        return option.id;
      }
    }
    return null;
  }

  /**
   * Valida um range customizado
   */
  static validateCustomRange(range: CustomRange): { isValid: boolean; error?: string } {
    if (range.min !== null && (range.min < 0 || range.min > 100)) {
      return { isValid: false, error: 'Valor mínimo deve estar entre 0 e 100' };
    }

    if (range.max !== null && (range.max < 0 || range.max > 100)) {
      return { isValid: false, error: 'Valor máximo deve estar entre 0 e 100' };
    }

    if (range.min !== null && range.max !== null && range.min > range.max) {
      return { isValid: false, error: 'Valor mínimo não pode ser maior que o máximo' };
    }

    return { isValid: true };
  }

  /**
   * Formata o estado do filtro para exibição
   */
  static formatFilterState(state: RangeFilterState, options: RangeOption[]): string {
    const parts: string[] = [];

    // Adiciona ranges selecionados
    state.selectedRanges.forEach(rangeId => {
      const option = options.find(opt => opt.id === rangeId);
      if (option) {
        parts.push(`${option.label} (${option.minValue}-${option.maxValue})`);
      }
    });

    // Adiciona range customizado se definido
    if (state.customRange.min !== null || state.customRange.max !== null) {
      const min = state.customRange.min ?? 0;
      const max = state.customRange.max ?? 100;
      parts.push(`Custom (${min}-${max})`);
    }

    return parts.length > 0 ? parts.join(', ') : '';
  }
}
