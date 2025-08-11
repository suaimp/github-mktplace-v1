/**
 * Serviço global para operações CRUD de outlines (pautas)
 * Localizado em db-service seguindo o princípio de responsabilidade única
 */

import { supabase } from '../../lib/supabase';
import { OrderNotificationService } from '../order-notifications/OrderNotificationService';

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

export interface CreateOutlineData {
  order_item_id: string;
  palavra_chave?: string;
  url_site?: string;
  texto_ancora?: string;
  requisitos_especiais?: string;
}

export interface UpdateOutlineData {
  palavra_chave?: string;
  url_site?: string;
  texto_ancora?: string;
  requisitos_especiais?: string;
}

export class OutlineService {
  /**
   * Busca uma pauta por ID do item do pedido
   */
  static async getByItemId(itemId: string): Promise<OutlineData | null> {
    try {
      const { data, error } = await supabase
        .from('outlines')
        .select('*')
        .eq('order_item_id', itemId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar pauta:', error);
        throw new Error('Erro ao buscar dados da pauta');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço getByItemId:', error);
      throw error;
    }
  }

  /**
   * Busca uma pauta por ID
   */
  static async getById(id: string): Promise<OutlineData | null> {
    try {
      const { data, error } = await supabase
        .from('outlines')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar pauta por ID:', error);
        throw new Error('Erro ao buscar dados da pauta');
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço getById:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova pauta
   */
  static async create(data: CreateOutlineData): Promise<OutlineData> {
    try {
      console.log('[PAUTA_DEBUG] Iniciando criação de pauta:', data);
      
      const { data: newOutline, error } = await supabase
        .from('outlines')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('[PAUTA_DEBUG] Erro ao criar pauta:', error);
        console.error('Erro ao criar pauta:', error);
        throw new Error('Erro ao criar pauta');
      }

      console.log('[PAUTA_DEBUG] Pauta criada com sucesso:', newOutline);
      
      // Enviar notificação por email após criação bem-sucedida
      try {
        console.log('[PAUTA_DEBUG] Iniciando envio de notificação...');
        
        // Buscar o order_id do order_item
        const { data: orderItem, error: orderItemError } = await supabase
          .from('order_items')
          .select('order_id')
          .eq('id', data.order_item_id)
          .single();

        if (orderItemError || !orderItem) {
          console.error('[PAUTA_DEBUG] Erro ao buscar order_item:', orderItemError);
          throw new Error('Não foi possível encontrar o order_item');
        }

        console.log('[PAUTA_DEBUG] Order_id encontrado:', orderItem.order_id);

        // Preparar dados da pauta para o email
        const pautaData = {
          palavraChave: data.palavra_chave || '',
          urlSite: data.url_site || '',
          textoAncora: data.texto_ancora || '',
          requisitosEspeciais: data.requisitos_especiais || ''
        };

        console.log('[PAUTA_DEBUG] Enviando notificação com dados:', { 
          orderId: orderItem.order_id, 
          orderItemId: data.order_item_id, 
          pautaData 
        });

        await OrderNotificationService.sendPautaNotification(
          orderItem.order_id,
          data.order_item_id,
          pautaData
        );
        
        console.log('[PAUTA_DEBUG] Notificação enviada com sucesso');
      } catch (notificationError) {
        console.error('[PAUTA_DEBUG] Erro ao enviar notificação:', notificationError);
        // Não falhar a criação da pauta se a notificação falhar
      }

      return newOutline;
    } catch (error) {
      console.error('[PAUTA_DEBUG] Erro no serviço create:', error);
      console.error('Erro no serviço create:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma pauta existente
   */
  static async update(itemId: string, data: UpdateOutlineData): Promise<OutlineData> {
    try {
      const { data: updatedOutline, error } = await supabase
        .from('outlines')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('order_item_id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar pauta:', error);
        throw new Error('Erro ao atualizar pauta');
      }

      return updatedOutline;
    } catch (error) {
      console.error('Erro no serviço update:', error);
      throw error;
    }
  }

  /**
   * Remove uma pauta
   */
  static async delete(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('outlines')
        .delete()
        .eq('order_item_id', itemId);

      if (error) {
        console.error('Erro ao remover pauta:', error);
        throw new Error('Erro ao remover pauta');
      }
    } catch (error) {
      console.error('Erro no serviço delete:', error);
      throw error;
    }
  }

  /**
   * Verifica se existe uma pauta para o item do pedido
   */
  static async exists(itemId: string): Promise<boolean> {
    try {
      const data = await this.getByItemId(itemId);
      return data !== null;
    } catch (error) {
      console.error('Erro ao verificar existência da pauta:', error);
      return false;
    }
  }

  /**
   * Lista todas as pautas de um pedido
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
        console.error('Erro ao buscar pautas do pedido:', error);
        throw new Error('Erro ao buscar pautas do pedido');
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço getByOrderId:', error);
      throw error;
    }
  }
}
