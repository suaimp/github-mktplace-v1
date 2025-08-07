import { FormEntryValuesService } from "../../components/EditorialManager/services/formEntryValuesService";
import { BestSellingSitesService, BestSellingSite } from "./bestSellingSitesService";
import { PriceProcessingService, ProcessedPriceInfo } from "./priceProcessingService";
import { supabase } from "../../lib/supabase";

export interface SiteWithPriceData {
  siteName: string;
  siteUrl: string;
  price: string;
  priceInfo?: ProcessedPriceInfo;
  quantity: number;
  favicon: string;
}

/**
 * Serviço responsável por combinar dados de sites com informações de preços
 * Segue o princípio de responsabilidade única
 */
export class SitePriceIntegrationService {
  /**
   * Busca o campo de produto no formulário
   */
  private static async getProductField(): Promise<{ id: string; field_type: string; label: string } | null> {
    try {
      const { data: formFields, error } = await supabase
        .from('form_fields')
        .select('id, field_type, label')
        .eq('field_type', 'product')
        .limit(1);

      console.log('[SitePriceIntegration] Campos de produto encontrados:', {
        fields: formFields,
        count: formFields?.length || 0,
        selectedField: formFields?.[0]
      });

      if (error) {
        console.error('SitePriceIntegrationService - Erro ao buscar campo de produto:', error);
        return null;
      }

      return formFields?.[0] || null;
    } catch (error) {
      console.error('SitePriceIntegrationService - Erro inesperado ao buscar campo de produto:', error);
      return null;
    }
  }

  /**
   * Extrai URL base do site para nome
   */
  private static formatSiteName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  /**
   * Gera URL do favicon
   */
  private static getFaviconUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return '';
    }
  }

  /**
   * Busca dados de preço para um site específico
   */
  private static async getSitePriceData(
    site: BestSellingSite, 
    productField: { id: string; field_type: string; label: string }
  ): Promise<{ price: string; priceInfo?: ProcessedPriceInfo }> {
    try {
      console.log(`[SitePriceIntegration] Buscando dados para site:`, {
        entry_id: site.entry_id,
        product_url: site.product_url,
        productField_id: productField.id
      });

      // Buscar valores do form_entry_values
      const valuesResult = await FormEntryValuesService.getFormEntryValues(site.entry_id);
      
      console.log(`[SitePriceIntegration] Resultado da busca para ${site.entry_id}:`, {
        success: !!valuesResult.data,
        dataLength: valuesResult.data?.length || 0,
        allFieldIds: valuesResult.data?.map((v: any) => v.field_id) || [],
        lookingForFieldId: productField.id
      });

      if (!valuesResult.data || valuesResult.data.length === 0) {
        return { price: "Preço não disponível" };
      }

      // Procurar especificamente pelo campo de produto
      const priceField = valuesResult.data.find(
        (value: any) => value.field_id === productField.id
      );

      // Se não encontrou o campo específico, vamos procurar por qualquer campo com dados de preço
      let alternativePriceField = null;
      if (!priceField) {
        console.log(`[SitePriceIntegration] Campo específico não encontrado, procurando alternativas para ${site.entry_id}:`);
        
        // Procurar por campos que tenham value_json com dados de preço
        const fieldsWithPriceData = valuesResult.data.filter((value: any) => {
          if (!value.value_json || typeof value.value_json !== 'object') return false;
          const hasPrice = value.value_json.price || value.value_json.promotional_price;
          if (hasPrice) {
            console.log(`[SitePriceIntegration] Campo com dados de preço encontrado:`, {
              field_id: value.field_id,
              value_json: value.value_json
            });
          }
          return hasPrice;
        });

        alternativePriceField = fieldsWithPriceData[0]; // Pega o primeiro que tem dados de preço
      }

      const finalPriceField = priceField || alternativePriceField;

      console.log(`[SitePriceIntegration] Campo de preço encontrado para ${site.entry_id}:`, {
        found: !!finalPriceField,
        field_id: finalPriceField?.field_id,
        has_value_json: !!finalPriceField?.value_json,
        value_json_type: typeof finalPriceField?.value_json,
        usedAlternative: !priceField && !!alternativePriceField
      });

      if (!finalPriceField || !finalPriceField.value_json) {
        return { price: "Preço não disponível" };
      }

      // Extrair e processar dados de preço
      const priceData = PriceProcessingService.extractPriceData(finalPriceField.value_json);
      console.log(`[SitePriceIntegration] Dados extraídos para ${site.entry_id}:`, {
        rawValueJson: finalPriceField.value_json,
        extractedPriceData: priceData
      });
      
      if (!priceData) {
        return { price: "Preço não disponível" };
      }

      const processedPrice = PriceProcessingService.processProductPrice(priceData);
      console.log(`[SitePriceIntegration] Preço processado para ${site.entry_id}:`, {
        processedPrice,
        hasValidProcessedPrice: !!processedPrice
      });
      
      if (!processedPrice) {
        return { price: "Preço não disponível" };
      }

      const result = {
        price: processedPrice.formattedPrice,
        priceInfo: processedPrice
      };
      
      console.log(`[SitePriceIntegration] Resultado final para ${site.entry_id}:`, result);
      
      return result;

    } catch (error) {
      console.error(`SitePriceIntegrationService - Erro ao processar preço para ${site.entry_id}:`, error);
      return { price: "Erro ao carregar preço" };
    }
  }

  /**
   * Busca sites mais vendidos com dados de preço integrados
   */
  static async getSitesWithPrices(limit: number = 10): Promise<SiteWithPriceData[]> {
    try {
      // 1. Buscar sites mais vendidos
      const sites = await BestSellingSitesService.getBestSellingSites(limit);
      
      if (sites.length === 0) {
        return [];
      }

      // 2. Buscar campo de produto
      const productField = await this.getProductField();
      if (!productField) {
        console.error('SitePriceIntegrationService - Campo de produto não encontrado');
        return sites.map(site => ({
          siteName: this.formatSiteName(site.product_url),
          siteUrl: site.product_url,
          price: "Configuração não encontrada",
          quantity: site.quantity,
          favicon: this.getFaviconUrl(site.product_url)
        }));
      }

      // 3. Processar cada site em paralelo
      const sitesWithPrices = await Promise.all(
        sites.map(async (site): Promise<SiteWithPriceData> => {
          const { price, priceInfo } = await this.getSitePriceData(site, productField);

          return {
            siteName: this.formatSiteName(site.product_url),
            siteUrl: site.product_url,
            price,
            priceInfo,
            quantity: site.quantity,
            favicon: this.getFaviconUrl(site.product_url)
          };
        })
      );

      return sitesWithPrices;

    } catch (error) {
      console.error('SitePriceIntegrationService - Erro ao buscar sites com preços:', error);
      throw error;
    }
  }
}
