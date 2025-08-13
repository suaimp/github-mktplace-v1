/**
 * Serviço para filtros de link (Dofollow/Nofollow)
 * Responsabilidade: Gerar opções de tipo de link para filtros
 */

import { LinkTypeFilterOption } from '../types/LinksFilterTypes';

export class LinksFilterService {
  /**
   * Gera opções de filtro por tipo de link
   */
  static generateLinkTypeFilterOptions(): LinkTypeFilterOption[] {
    return [
      { id: 'dofollow', label: 'Dofollow', value: 'Dofollow' },
      { id: 'nofollow', label: 'Nofollow', value: 'Nofollow' }
    ];
  }

  /**
   * Verifica se um valor de link corresponde aos tipos selecionados
   */
  static isLinkTypeSelected(linkValue: any, selectedTypes: string[]): boolean {
    if (!linkValue || selectedTypes.length === 0) return false;

    const linkStr = String(linkValue).trim();
    
    // Verifica se o valor corresponde a algum dos tipos selecionados
    return selectedTypes.some(selectedType => {
      const option = this.generateLinkTypeFilterOptions().find(opt => opt.id === selectedType);
      return option && linkStr === option.value;
    });
  }

  /**
   * Verifica se um valor é do tipo link (Dofollow/Nofollow)
   */
  static isValidLinkType(value: any): boolean {
    const linkStr = String(value).trim();
    return linkStr === 'Dofollow' || linkStr === 'Nofollow';
  }
}
