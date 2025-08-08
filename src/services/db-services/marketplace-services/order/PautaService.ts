/**
 * Serviço para gerenciar pautas de artigos
 */

import { supabase } from '../../../../lib/supabase';

export interface PautaFormData {
  palavraChave: string;
  urlSite: string;
  textoAncora: string;
  requisitosEspeciais: string;
}

export interface PautaData {
  id?: string;
  itemId: string;
  palavraChave: string;
  urlSite: string;
  textoAncora: string;
  requisitosEspeciais: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Classe de serviço para operações CRUD de pautas
 */
export class PautaService {
  /**
   * Salva uma nova pauta no banco de dados
   */
  static async createPauta(itemId: string, pautaData: PautaFormData): Promise<PautaData | null> {
    try {
      console.log('📝 Salvando pauta para item:', { itemId, pautaData });

      const { data, error } = await supabase
        .from('pautas')
        .insert({
          item_id: itemId,
          palavra_chave: pautaData.palavraChave,
          url_site: pautaData.urlSite,
          texto_ancora: pautaData.textoAncora,
          requisitos_especiais: pautaData.requisitosEspeciais,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar pauta:', error);
        throw error;
      }

      console.log('✅ Pauta salva com sucesso:', data);
      
      return {
        id: data.id,
        itemId: data.item_id,
        palavraChave: data.palavra_chave,
        urlSite: data.url_site,
        textoAncora: data.texto_ancora,
        requisitosEspeciais: data.requisitos_especiais,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erro no PautaService.createPauta:', error);
      throw error;
    }
  }

  /**
   * Busca a pauta de um item específico
   */
  static async getPautaByItemId(itemId: string): Promise<PautaData | null> {
    try {
      console.log('🔍 Buscando pauta para item:', itemId);

      const { data, error } = await supabase
        .from('pautas')
        .select('*')
        .eq('item_id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhuma pauta encontrada
          return null;
        }
        console.error('❌ Erro ao buscar pauta:', error);
        throw error;
      }

      return {
        id: data.id,
        itemId: data.item_id,
        palavraChave: data.palavra_chave,
        urlSite: data.url_site,
        textoAncora: data.texto_ancora,
        requisitosEspeciais: data.requisitos_especiais,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erro no PautaService.getPautaByItemId:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma pauta existente
   */
  static async updatePauta(itemId: string, pautaData: PautaFormData): Promise<PautaData | null> {
    try {
      console.log('📝 Atualizando pauta para item:', { itemId, pautaData });

      const { data, error } = await supabase
        .from('pautas')
        .update({
          palavra_chave: pautaData.palavraChave,
          url_site: pautaData.urlSite,
          texto_ancora: pautaData.textoAncora,
          requisitos_especiais: pautaData.requisitosEspeciais,
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar pauta:', error);
        throw error;
      }

      console.log('✅ Pauta atualizada com sucesso:', data);
      
      return {
        id: data.id,
        itemId: data.item_id,
        palavraChave: data.palavra_chave,
        urlSite: data.url_site,
        textoAncora: data.texto_ancora,
        requisitosEspeciais: data.requisitos_especiais,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erro no PautaService.updatePauta:', error);
      throw error;
    }
  }

  /**
   * Exclui uma pauta
   */
  static async deletePauta(itemId: string): Promise<boolean> {
    try {
      console.log('🗑️ Excluindo pauta para item:', itemId);

      const { error } = await supabase
        .from('pautas')
        .delete()
        .eq('item_id', itemId);

      if (error) {
        console.error('❌ Erro ao excluir pauta:', error);
        throw error;
      }

      console.log('✅ Pauta excluída com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no PautaService.deletePauta:', error);
      return false;
    }
  }
}
