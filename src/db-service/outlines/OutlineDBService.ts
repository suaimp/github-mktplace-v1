/**
 * Serviço global para operações com outlines (pautas)
 */

import { supabase } from '../../lib/supabase';

export interface OutlineData {
  id: string;
  order_item_id: string;
  palavra_chave?: string;
  url_site?: string;
  texto_ancora?: string;
  requisitos_especiais?: string;
  created_at: string;
  updated_at: string;
}

export class OutlineDBService {
  /**
   * Busca outline por ID do item do pedido
   */
  static async getByOrderItemId(orderItemId: string): Promise<OutlineData | null> {
    try {
      const { data, error } = await supabase
        .from('outlines')
        .select('*')
        .eq('order_item_id', orderItemId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar outline:', error);
        throw new Error('Erro ao buscar dados da pauta');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço getByOrderItemId:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova outline
   */
  static async create(data: Omit<OutlineData, 'id' | 'created_at' | 'updated_at'>): Promise<OutlineData> {
    try {
      const { data: result, error } = await supabase
        .from('outlines')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar outline:', error);
        throw new Error('Erro ao criar pauta');
      }

      return result;
    } catch (error) {
      console.error('Erro no serviço create:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma outline existente
   */
  static async update(id: string, data: Partial<Omit<OutlineData, 'id' | 'created_at' | 'updated_at'>>): Promise<OutlineData> {
    try {
      const { data: result, error } = await supabase
        .from('outlines')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar outline:', error);
        throw new Error('Erro ao atualizar pauta');
      }

      return result;
    } catch (error) {
      console.error('Erro no serviço update:', error);
      throw error;
    }
  }

  /**
   * Deleta uma outline
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('outlines')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar outline:', error);
        throw new Error('Erro ao deletar pauta');
      }
    } catch (error) {
      console.error('Erro no serviço delete:', error);
      throw error;
    }
  }

  /**
   * Verifica se existe outline para um item do pedido
   */
  static async exists(orderItemId: string): Promise<boolean> {
    try {
      const data = await this.getByOrderItemId(orderItemId);
      return data !== null;
    } catch (error) {
      console.error('Erro ao verificar existência da outline:', error);
      return false;
    }
  }

  /**
   * Lista todas as outlines de um pedido
   */
  static async getByOrderId(orderId: string): Promise<OutlineData[]> {
    try {
      const { data, error } = await supabase
        .from('outlines')
        .select(`
          *,
          order_items!inner(order_id)
        `)
        .eq('order_items.order_id', orderId);

      if (error) {
        console.error('Erro ao buscar outlines do pedido:', error);
        throw new Error('Erro ao buscar pautas do pedido');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço getByOrderId:', error);
      throw error;
    }
  }
}
