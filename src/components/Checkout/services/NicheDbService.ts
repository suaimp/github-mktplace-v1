import { supabase } from "../../../lib/supabase";
import { NicheInitializationService, CartItem } from "../services/NicheInitializationService";
import { updateCartCheckoutResume } from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";

/**
 * Serviço responsável pelas operações de banco de dados relacionadas aos nichos
 * Mantém responsabilidade única para operações CRUD de nichos
 */
export class NicheDbService {
  /**
   * Inicializa nichos no banco para itens que não têm seleção válida
   */
  static async initializeMissingNiches(cartItems: CartItem[]): Promise<void> {
    const initializationPromises = cartItems
      .filter(item => NicheInitializationService.needsNicheInitialization(item))
      .map(item => this.saveNicheToDatabase(item.id, NicheInitializationService.createPlaceholderNicheData()));

    if (initializationPromises.length > 0) {
      await Promise.all(initializationPromises);
    }
  }

  /**
   * Salva um nicho específico no banco de dados
   */
  static async saveNicheToDatabase(itemId: string, nicheData: any[]): Promise<void> {
    try {
      await updateCartCheckoutResume(itemId, {
        niche_selected: nicheData
      });
    } catch (error) {
      console.error(`Erro ao salvar nicho para item ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Busca itens do carrinho com seus nichos do banco
   */
  static async getCartItemsWithNiches(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_checkout_resume')
        .select('id, niche_selected')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao buscar itens do carrinho:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na consulta do carrinho:', error);
      return [];
    }
  }
}
