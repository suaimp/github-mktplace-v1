import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { FormEntryValuesService } from '../../../../EditorialManager/services/formEntryValuesService';
import { SiteDisplayData, FormEntryPrice } from '../types';
import { extractPriceInfo, formatSiteName, getFaviconUrl } from '../utils/dataFormatters';

export function useBestSellingSitesChart() {
  const [data, setData] = useState<SiteDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Buscar sites mais vendidos (ordenados por quantidade)
      const { data: sites, error: sitesError } = await supabase
        .from('best_selling_sites')
        .select('*')
        .order('quantity', { ascending: false })
        .limit(10);
      
      if (sitesError) {
        throw new Error(sitesError.message || 'Erro ao carregar sites');
      }

      if (!sites || sites.length === 0) {
        setData([]);
        return;
      }

      // 2. Para cada site, buscar o preço no form_entry_values
      const sitesWithPrices = await Promise.all(
        sites.map(async (site: any) => {
          try {
            // Buscar os valores do form_entry_values para este entry_id
            const valuesResult = await FormEntryValuesService.getFormEntryValues(site.entry_id);
            
            let priceInfo = {
              price: "Preço não disponível",
              promotionalPrice: undefined as string | undefined,
              oldPrice: undefined as string | undefined,
              hasPromotion: false
            };
            
            if (valuesResult.data && valuesResult.data.length > 0) {
              // Procurar por campo de preço nos valores
              const priceField = valuesResult.data.find(
                (value: any) => 
                  value.value?.includes('R$') || 
                  value.value?.includes('price') ||
                  (value.value_json && typeof value.value_json === 'object' && 'price' in value.value_json)
              );

              if (priceField) {
                const priceData: FormEntryPrice = {
                  value: priceField.value,
                  value_json: priceField.value_json
                };
                console.log('priceField raw data:', priceField);
                console.log('priceData:', priceData);
                const extractedInfo = extractPriceInfo(priceData);
                priceInfo = {
                  price: extractedInfo.price,
                  promotionalPrice: extractedInfo.promotionalPrice,
                  oldPrice: extractedInfo.oldPrice,
                  hasPromotion: extractedInfo.hasPromotion
                };
                console.log('extracted price info:', priceInfo);
              }
            }

            return {
              siteName: formatSiteName(site.product_url),
              siteUrl: site.product_url,
              price: priceInfo.price,
              promotionalPrice: priceInfo.promotionalPrice,
              oldPrice: priceInfo.oldPrice,
              hasPromotion: priceInfo.hasPromotion,
              quantity: site.quantity,
              favicon: getFaviconUrl(site.product_url)
            } as SiteDisplayData;
          } catch (siteError) {
            console.error(`Erro ao processar site ${site.product_name}:`, siteError);
            return {
              siteName: formatSiteName(site.product_url),
              siteUrl: site.product_url,
              price: "Erro ao carregar preço",
              promotionalPrice: undefined,
              oldPrice: undefined,
              hasPromotion: false,
              quantity: site.quantity,
              favicon: getFaviconUrl(site.product_url)
            } as SiteDisplayData;
          }
        })
      );

      // 3. Ordenar por quantidade (mais vendidos primeiro) e limitar a 5
      const topSites = sitesWithPrices
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setData(topSites);
    } catch (err) {
      console.error('Erro ao carregar dados do chart:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
}
