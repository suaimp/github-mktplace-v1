import { NICHE_OPTIONS } from "../constants/options";

export interface NicheInitializationResult {
  [itemId: string]: string;
}

export interface CartItem {
  id: string;
  niche_selected?: any;
}

/**
 * Serviço responsável pela inicialização correta dos nichos
 * Garante que o placeholder seja mantido corretamente
 */
export class NicheInitializationService {
  /**
   * Inicializa os nichos a partir dos dados do carrinho
   * Mantém o placeholder quando não há seleção válida
   */
  static initializeNichesFromCartData(cartItems: CartItem[]): NicheInitializationResult {
    const initialized: NicheInitializationResult = {};

    cartItems.forEach((item) => {
      const extractedNiche = this.extractNicheValue(item.niche_selected);
      
      // Se o valor extraído for válido e não for placeholder, use-o
      if (this.isValidNicheSelection(extractedNiche)) {
        initialized[item.id] = extractedNiche;
      } else {
        // Caso contrário, use o placeholder
        initialized[item.id] = NICHE_OPTIONS.PLACEHOLDER;
      }
    });

    return initialized;
  }

  /**
   * Extrai o valor do nicho de diferentes formatos de dados
   */
  private static extractNicheValue(nicheSelected: any): string {
    if (!nicheSelected) return NICHE_OPTIONS.PLACEHOLDER;

    // Se é array
    if (Array.isArray(nicheSelected) && nicheSelected.length > 0) {
      const firstItem = nicheSelected[0];
      if (typeof firstItem === 'object' && firstItem.niche) {
        return firstItem.niche;
      }
      if (typeof firstItem === 'string') {
        return firstItem;
      }
    }

    // Se é objeto
    if (typeof nicheSelected === 'object' && nicheSelected.niche) {
      return nicheSelected.niche;
    }

    // Se é string
    if (typeof nicheSelected === 'string') {
      try {
        const parsed = JSON.parse(nicheSelected);
        if (parsed && typeof parsed === 'object' && parsed.niche) {
          return parsed.niche;
        }
        return nicheSelected.trim();
      } catch {
        return nicheSelected.trim();
      }
    }

    return NICHE_OPTIONS.PLACEHOLDER;
  }

  /**
   * Verifica se uma seleção de nicho é válida (não é placeholder nem vazia)
   */
  private static isValidNicheSelection(value: string): boolean {
    return Boolean(value) && 
           value.trim() !== '' && 
           value !== NICHE_OPTIONS.PLACEHOLDER &&
           value !== 'null' &&
           value !== 'undefined';
  }

  /**
   * Determina se um item precisa ter seu nicho inicializado no banco
   */
  static needsNicheInitialization(item: CartItem): boolean {
    const extractedValue = this.extractNicheValue(item.niche_selected);
    return !this.isValidNicheSelection(extractedValue) && extractedValue !== NICHE_OPTIONS.PLACEHOLDER;
  }

  /**
   * Cria o objeto para salvar no banco quando é placeholder
   */
  static createPlaceholderNicheData() {
    return [{ niche: NICHE_OPTIONS.PLACEHOLDER, price: "0" }];
  }
}
