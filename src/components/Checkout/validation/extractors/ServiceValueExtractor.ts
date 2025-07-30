/**
 * Extrator de valores de serviço de diferentes formatos de dados
 * Responsabilidade única: Extrair e normalizar valores de service_selected
 */

export class ServiceValueExtractor {
  /**
   * Extrai o valor do serviço de diferentes formatos de dados
   * @param serviceSelected - Dados do serviço selecionado (string, objeto, array)
   * @returns string | null - Valor extraído ou null se inválido
   */
  static extract(serviceSelected: any): string | null {
    if (!serviceSelected) return null;
    
    // Se é string, tenta fazer parse JSON primeiro
    if (typeof serviceSelected === 'string') {
      // Se é string vazia ou 'null'/'undefined' como string
      if (serviceSelected.trim() === '' || 
          serviceSelected === 'null' || 
          serviceSelected === 'undefined') {
        return null;
      }
      
      // Tenta fazer parse JSON
      try {
        const parsed = JSON.parse(serviceSelected);
        return this.extractFromParsedData(parsed);
      } catch {
        // Se não é JSON válido, retorna a string original
        return serviceSelected.trim();
      }
    }
    
    // Se é array
    if (Array.isArray(serviceSelected) && serviceSelected.length > 0) {
      const firstItem = serviceSelected[0];
      return this.extractFromItem(firstItem);
    }
    
    // Se é objeto
    if (typeof serviceSelected === 'object' && serviceSelected !== null) {
      return this.extractFromItem(serviceSelected);
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
    
    if (typeof item === 'object' && item !== null && item.title) {
      return typeof item.title === 'string' ? item.title.trim() || null : null;
    }
    
    return null;
  }
}
