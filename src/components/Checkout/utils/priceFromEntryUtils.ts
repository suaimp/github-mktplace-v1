import { supabase } from "../../../lib/supabase";

/**
 * Busca o preço correto (promotional_price se disponível, senão price)
 * da tabela form_entry_values usando o entry_id
 */
export async function getPriceFromEntry(
  entryId: string
): Promise<number | null> {
  try {
    console.log(`[getPriceFromEntry] Buscando preço para entry_id: ${entryId}`);

    // Busca os registros na tabela form_entry_values pelo entry_id
    const { data, error } = await supabase
      .from("form_entry_values")
      .select("value, value_json")
      .eq("entry_id", entryId);

    if (error || !data || data.length === 0) {
      console.log(`[getPriceFromEntry] Erro ou dados não encontrados:`, error);
      return null;
    }

    console.log(`[getPriceFromEntry] Dados encontrados:`, data);

    // Função auxiliar para extrair preço de um objeto
    const extractPrice = (obj: any): number | null => {
      if (!obj || typeof obj !== "object") return null;

      // Prioriza promotional_price se existir e for válido
      if (
        obj.promotional_price !== undefined &&
        obj.promotional_price !== null &&
        obj.promotional_price !== ""
      ) {
        let promoPrice = obj.promotional_price;

        // Se for string, converte o formato brasileiro (ex: "1950,13") para number
        if (typeof promoPrice === "string") {
          const normalized = promoPrice
            .replace(/\./g, "")
            .replace(",", ".")
            .replace(/[^0-9.]/g, "");
          promoPrice = parseFloat(normalized);
        }

        if (!isNaN(promoPrice) && promoPrice > 0) {
          console.log(
            `[getPriceFromEntry] Usando promotional_price: ${promoPrice}`
          );
          return promoPrice;
        }
      }

      // Senão, usa price normal
      if (obj.price !== undefined && obj.price !== null && obj.price !== "") {
        let normalPrice = obj.price;

        // Se for string, converte o formato brasileiro (ex: "3000,07") para number
        if (typeof normalPrice === "string") {
          const normalized = normalPrice
            .replace(/\./g, "")
            .replace(",", ".")
            .replace(/[^0-9.]/g, "");
          normalPrice = parseFloat(normalized);
        }

        if (!isNaN(normalPrice)) {
          console.log(
            `[getPriceFromEntry] Usando price normal: ${normalPrice}`
          );
          return normalPrice;
        }
      }

      return null;
    };

    // Procura em todos os registros encontrados
    for (const record of data) {
      // Verifica primeiro value_json (se for um objeto)
      if (record.value_json) {
        try {
          const valueJsonObj =
            typeof record.value_json === "string"
              ? JSON.parse(record.value_json)
              : record.value_json;

          const priceFromJson = extractPrice(valueJsonObj);
          if (priceFromJson !== null) {
            return priceFromJson;
          }
        } catch (e) {
          console.log(`[getPriceFromEntry] Erro ao parsear value_json:`, e);
        }
      }

      // Verifica value (se for um objeto JSON em string)
      if (record.value) {
        try {
          const valueObj =
            typeof record.value === "string"
              ? JSON.parse(record.value)
              : record.value;

          const priceFromValue = extractPrice(valueObj);
          if (priceFromValue !== null) {
            return priceFromValue;
          }
        } catch (e) {
          // Se não conseguir parsear, pode ser um valor simples
          const simplePrice = Number(record.value);
          if (!isNaN(simplePrice)) {
            console.log(
              `[getPriceFromEntry] Usando value simples: ${simplePrice}`
            );
            return simplePrice;
          }
        }
      }
    }

    console.log(`[getPriceFromEntry] Nenhum preço válido encontrado`);
    return null;
  } catch (error) {
    console.error(`[getPriceFromEntry] Erro ao buscar preço:`, error);
    return null;
  }
}

/**
 * Cache simples para evitar múltiplas consultas para o mesmo entry_id
 */
const priceCache = new Map<
  string,
  { price: number | null; timestamp: number }
>();
const CACHE_DURATION = 30000; // 30 segundos

export async function getPriceFromEntryWithCache(
  entryId: string
): Promise<number | null> {
  const now = Date.now();
  const cached = priceCache.get(entryId);

  // Verifica se existe cache válido
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(
      `[getPriceFromEntryWithCache] Usando cache para entry_id: ${entryId}`
    );
    return cached.price;
  }

  // Busca novo preço
  const price = await getPriceFromEntry(entryId);

  // Armazena no cache
  priceCache.set(entryId, { price, timestamp: now });

  return price;
}
