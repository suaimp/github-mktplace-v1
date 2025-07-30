/**
 * Extrator de valores de nicho de diferentes formatos de dados
 * Responsabilidade única: Extrair e normalizar valores de niche_selected
 */

export class NicheValueExtractor {
  /**
   * Extrai o valor do nicho de diferentes formatos de dados
   * @param nicheSelected - Dados do nicho selecionado (string, objeto, array)
   * @returns string | null - Valor extraído ou null se inválido
   */
  static extract(nicheSelected: any): string | null {
    if (!nicheSelected) return null;
    
    // Se é string, tenta fazer parse JSON primeiro
    if (typeof nicheSelected === 'string') {
      // Se é string vazia ou 'null'/'undefined' como string
      if (nicheSelected.trim() === '' || 
          nicheSelected === 'null' || 
          nicheSelected === 'undefined') {
        return null;
      }
      
      // Tenta fazer parse JSON
      try {
        const parsed = JSON.parse(nicheSelected);
        return this.extractFromParsedData(parsed);
      } catch {
        // Se não é JSON válido, retorna a string original
        return nicheSelected.trim();
      }
    }
    
    // Se é array
    if (Array.isArray(nicheSelected) && nicheSelected.length > 0) {
      const firstItem = nicheSelected[0];
      return this.extractFromItem(firstItem);
    }
    
    // Se é objeto
    if (typeof nicheSelected === 'object' && nicheSelected !== null) {
      return this.extractFromItem(nicheSelected);
    }
    
    return null;
  }

  /**
   * Extrai valor de dados já parseados (array ou objeto)
   */
  private static extractFromParsedData(parsed: any): string | null {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return this.extractFromItem(parsed[0]);
    }
    
    if (typeof parsed === 'object' && parsed !== null) {
      return this.extractFromItem(parsed);
    }
    
    return null;
  }

  /**
   * Extrai valor de um item individual
   */
  private static extractFromItem(item: any): string | null {
    if (typeof item === 'string') {
      return item.trim() || null;
    }
    
    if (typeof item === 'object' && item !== null && item.niche) {
      return typeof item.niche === 'string' ? item.niche.trim() || null : null;
    }
    
    return null;
  }
}
