/**
 * Serviço para gerenciar outline (pauta) nos order_items
 * Responsabilidade única: operações CRUD do outline
 */

import { OrderItemService } from '../../../../../services/db-services/marketplace-services/order/OrderItemService';
import { PautaFormData, PautaOutlineData } from '../types';

export class OutlineService {
  /**
   * Converte dados do formulário para formato do banco
   */
  private static formatOutlineData(formData: PautaFormData): PautaOutlineData {
    const now = new Date().toISOString();
    
    return {
      palavra_chave: formData.palavraChave,
      url_site: formData.urlSite,
      texto_ancora: formData.textoAncora,
      requisitos_especiais: formData.requisitosEspeciais,
      created_at: now,
      updated_at: now
    };
  }

  /**
   * Salva outline para um item específico
   */
  static async saveOutline(itemId: string, formData: PautaFormData): Promise<void> {
    try {
      console.log('📝 Salvando outline para item:', itemId);
      console.log('📋 Dados do formulário:', formData);

      const outlineData = this.formatOutlineData(formData);
      console.log('🔄 Dados formatados para o banco:', outlineData);

      await OrderItemService.updateOrderItemOutline(itemId, outlineData);
      
      console.log('✅ Outline salvo com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar outline:', error);
      throw new Error('Falha ao salvar pauta do artigo');
    }
  }

  /**
   * Recupera outline de um item específico
   */
  static async getOutline(itemId: string): Promise<PautaOutlineData | null> {
    try {
      console.log('🔍 Buscando outline para item:', itemId);
      
      // Usar método existente do OrderItemService para buscar o item
      const data = await OrderItemService.getOrderItemById(itemId);
      
      if (!data) {
        console.log('❌ Item não encontrado');
        return null;
      }

      console.log('📋 Outline encontrado:', (data as any).outline);
      return (data as any).outline || null;
    } catch (error) {
      console.error('❌ Erro ao buscar outline:', error);
      return null;
    }
  }

  /**
   * Verifica se um item possui outline
   */
  static async hasOutline(itemId: string): Promise<boolean> {
    try {
      const outline = await this.getOutline(itemId);
      return outline !== null;
    } catch (error) {
      console.error('❌ Erro ao verificar outline:', error);
      return false;
    }
  }
}
