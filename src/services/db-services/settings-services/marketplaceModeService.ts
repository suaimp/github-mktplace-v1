import { supabase } from "../../../lib/supabase";

export interface MarketplaceModeSettings {
  id: string;
  marketplace_in_test: boolean;
  marketplace_in_maintenance: boolean;
  marketplace_test_message: string | null;
  marketplace_maintenance_message: string | null;
  updated_at?: string;
}

export interface MarketplaceModeData {
  marketplace_in_test?: boolean;
  marketplace_in_maintenance?: boolean;
  marketplace_test_message?: string;
  marketplace_maintenance_message?: string;
}

/**
 * Serviço responsável pelo gerenciamento dos modos do marketplace (teste e manutenção)
 */
export class MarketplaceModeService {
  /**
   * Busca as configurações de modo do marketplace
   */
  static async getMarketplaceModeSettings(): Promise<MarketplaceModeSettings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select(`
          id,
          marketplace_in_test,
          marketplace_in_maintenance,
          marketplace_test_message,
          marketplace_maintenance_message,
          updated_at
        `)
        .single();

      if (error) {
        // Se não existe configuração, retorna null
        if (error.code === 'PGRST116') {
          console.warn('Nenhuma configuração de marketplace encontrada');
          return null;
        }
        throw error;
      }

      return data as MarketplaceModeSettings;
    } catch (error) {
      console.error('Erro ao buscar configurações de modo do marketplace:', error);
      return null;
    }
  }

  /**
   * Atualiza as configurações de modo do marketplace
   */
  static async updateMarketplaceModeSettings(
    data: MarketplaceModeData
  ): Promise<MarketplaceModeSettings | null> {
    try {
      const settings = await this.getMarketplaceModeSettings();
      if (!settings) {
        throw new Error('Configurações de marketplace não encontradas');
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: updatedData, error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', settings.id)
        .select(`
          id,
          marketplace_in_test,
          marketplace_in_maintenance,
          marketplace_test_message,
          marketplace_maintenance_message,
          updated_at
        `)
        .single();

      if (error) throw error;

      console.log('Configurações de modo do marketplace atualizadas com sucesso');
      return updatedData as MarketplaceModeSettings;
    } catch (error) {
      console.error('Erro ao atualizar configurações de modo do marketplace:', error);
      return null;
    }
  }

  /**
   * Ativa/desativa o modo de teste
   */
  static async toggleTestMode(
    enabled: boolean,
    message?: string
  ): Promise<boolean> {
    const updateData: MarketplaceModeData = {
      marketplace_in_test: enabled
    };

    if (message !== undefined) {
      updateData.marketplace_test_message = message;
    }

    const result = await this.updateMarketplaceModeSettings(updateData);
    return result !== null;
  }

  /**
   * Ativa/desativa o modo de manutenção
   */
  static async toggleMaintenanceMode(
    enabled: boolean,
    message?: string
  ): Promise<boolean> {
    const updateData: MarketplaceModeData = {
      marketplace_in_maintenance: enabled
    };

    if (message !== undefined) {
      updateData.marketplace_maintenance_message = message;
    }

    const result = await this.updateMarketplaceModeSettings(updateData);
    return result !== null;
  }

  /**
   * Atualiza apenas a mensagem do modo de teste
   */
  static async updateTestMessage(message: string): Promise<boolean> {
    const result = await this.updateMarketplaceModeSettings({
      marketplace_test_message: message
    });
    return result !== null;
  }

  /**
   * Atualiza apenas a mensagem do modo de manutenção
   */
  static async updateMaintenanceMessage(message: string): Promise<boolean> {
    const result = await this.updateMarketplaceModeSettings({
      marketplace_maintenance_message: message
    });
    return result !== null;
  }
}
