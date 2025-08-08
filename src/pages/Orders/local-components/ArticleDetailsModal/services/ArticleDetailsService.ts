/**
 * Serviço para operações relacionadas aos detalhes do artigo
 * Utiliza o serviço global de outlines
 */

import { OutlineService } from '../../../../../db-service/outlines';
import { PautaData } from '../types';

export class ArticleDetailsService {
  /**
   * Busca a pauta por ID do item do pedido
   */
  static async getPautaByItemId(itemId: string): Promise<PautaData | null> {
    try {
      return await OutlineService.getByItemId(itemId);
    } catch (error) {
      console.error('Erro no serviço getPautaByItemId:', error);
      throw error;
    }
  }

  /**
   * Verifica se existe uma pauta para o item do pedido
   */
  static async hasPauta(itemId: string): Promise<boolean> {
    try {
      return await OutlineService.exists(itemId);
    } catch (error) {
      console.error('Erro ao verificar existência da pauta:', error);
      return false;
    }
  }
}
