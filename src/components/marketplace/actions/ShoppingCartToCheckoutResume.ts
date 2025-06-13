import { useCallback } from "react";
import {
  createCartCheckoutResume,
  updateCartCheckoutResume,
  deleteCartCheckoutResume,
  getCartCheckoutResumeByUser
} from "../../../context/db-context/services/CartCheckoutResumeService";
import { getFormEntryValuesByEntryId } from "../../../context/db-context/services/formEntryValueService";
import { supabase } from "../../../lib/supabase";

// Adiciona entry_id na tipagem do CartCheckoutResume para facilitar buscas
export type CartCheckoutResumeWithEntry =
  import("../../../context/db-context/services/CartCheckoutResumeService").CartCheckoutResume & {
    entry_id: string;
  };

export function useShoppingCartToCheckoutResume() {
  console.log("📦 [ShoppingCartToCheckoutResume] HOOK inicializado");

  // Função para adicionar item ao checkout resume

  const add = useCallback(
    async (item: { user_id: string; entry_id: string; quantity: number }) => {
      console.log(
        "🟢 [ShoppingCartToCheckoutResume] FUNÇÃO ADD executada com item:",
        item
      );
      // Busca os valores do entry_id
      const allEntryValues = await getFormEntryValuesByEntryId(item.entry_id);
      console.log("allEntryValues:", allEntryValues);
      // Filtra apenas os que possuem o entry_id correspondente
      const filteredByEntryId = Array.isArray(allEntryValues)
        ? allEntryValues.filter((v) => v.entry_id === item.entry_id)
        : [];
      // Busca o primeiro que tenha value como string JSON e que, ao fazer parse, seja objeto com campo price
      const valueWithPrice = filteredByEntryId.find((v) => {
        if (typeof v.value === "string") {
          try {
            const parsed = JSON.parse(v.value);
            return parsed && typeof parsed === "object" && "price" in parsed;
          } catch {
            return false;
          }
        }
        return false;
      });
      let price = 0;
      if (valueWithPrice && typeof valueWithPrice.value === "string") {
        try {
          const parsed = JSON.parse(valueWithPrice.value);

          // NOVA LÓGICA: verifica se promotional_price existe e não está vazio
          let priceToUse = parsed.price; // valor padrão

          if (
            parsed.promotional_price &&
            parsed.promotional_price !== "" &&
            parsed.promotional_price !== null &&
            parsed.promotional_price !== undefined &&
            !isNaN(Number(parsed.promotional_price)) &&
            Number(parsed.promotional_price) > 0
          ) {
            // Se promotional_price tem valor válido, usa ele
            priceToUse = parsed.promotional_price;
            console.log(
              "ShoppingCartToCheckoutResume.ts - usando promotional_price:",
              parsed.promotional_price
            );
          } else {
            // Se promotional_price está vazio/null/undefined, usa price normal
            console.log(
              "ShoppingCartToCheckoutResume.ts - usando price normal:",
              parsed.price
            );

            priceToUse = parsed.price;
          }

          // Converte para número, removendo vírgula e pontos se necessário
          if (typeof priceToUse === "string") {
            const normalized = priceToUse
              .replace(/\./g, "")
              .replace(",", ".")
              .replace(/[^0-9.]/g, "");
            price = parseFloat(normalized);
          } else if (typeof priceToUse === "number") {
            price = priceToUse;
          }
        } catch {}
      }
      console.log(
        "ShoppingCartToCheckoutResume.ts - valor final enviado para cart_checkout_resume.price:",
        price
      );
      // NOVA LÓGICA: busca url https e remove https://
      const urlEntry = Array.isArray(allEntryValues)
        ? allEntryValues.find(
            (v) => typeof v.value === "string" && v.value.startsWith("https://")
          )
        : undefined;
      let urlWithoutHttps: string | null = null;
      if (urlEntry && typeof urlEntry.value === "string") {
        urlWithoutHttps = urlEntry.value.replace(/^https:\/\//, "");
      }
      console.log(
        "ShoppingCartToCheckoutResume.ts - url sem https://:",
        urlWithoutHttps
      );
      const onlyWithValueJson = Array.isArray(allEntryValues)
        ? allEntryValues.filter((v) => !!v.value_json)
        : [];
      console.log(
        "ShoppingCartToCheckoutResume.ts - allEntryValues com value_json:",
        onlyWithValueJson
      );
      // Filtra apenas os que possuem value_json com algum item de array contendo campo niche
      const entryValues = onlyWithValueJson.filter(
        (v) =>
          v.entry_id === item.entry_id &&
          v.value_json &&
          (() => {
            try {
              const json =
                typeof v.value_json === "string"
                  ? JSON.parse(v.value_json)
                  : v.value_json;
              // Se value_json for um array, verifica se algum item tem campo niche
              if (Array.isArray(json)) {
                return json.some(
                  (el) => el && typeof el === "object" && "niche" in el
                );
              }
              // Se for objeto, verifica se algum valor é array com campo niche
              if (json && typeof json === "object") {
                return Object.values(json).some(
                  (arr) =>
                    Array.isArray(arr) &&
                    arr.some(
                      (el) => el && typeof el === "object" && "niche" in el
                    )
                );
              }
              return false;
            } catch {
              return false;
            }
          })()
      );
      console.log(
        "ShoppingCartToCheckoutResume.ts - entryValues com value_json contendo array com campo niche:",
        entryValues
      );
      // Cria um array apenas com os value_json dos entryValues filtrados
      const entryValuesValueJson = entryValues.map((v) => v.value_json);
      // Filtra para retornar apenas os arrays de nichos (ex: [{niche: ..., price: ...}, ...])
      const onlyNicheArrays = entryValuesValueJson
        .map((json) => {
          try {
            const parsed = typeof json === "string" ? JSON.parse(json) : json;
            if (
              Array.isArray(parsed) &&
              parsed.every(
                (el) => el && typeof el === "object" && "niche" in el
              )
            ) {
              return parsed;
            }
            if (parsed && typeof parsed === "object") {
              const arr = Object.values(parsed).find(
                (v) =>
                  Array.isArray(v) &&
                  v.every((el) => el && typeof el === "object" && "niche" in el)
              );
              return arr || null;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter((arr) => Array.isArray(arr) && arr.length > 0);
      // Pega apenas a instância 0 (primeiro array de niches)
      const nichesArray = onlyNicheArrays[0] || [];
      console.log(
        "ShoppingCartToCheckoutResume.ts - nichesArray:",
        nichesArray
      );
      const payload = {
        user_id: item.user_id,
        entry_id: item.entry_id,
        product_url: urlWithoutHttps,
        quantity: item.quantity,
        niche: JSON.stringify(nichesArray),
        price: price, // agora sempre number
        service_content: ""
      };
      console.log("ShoppingCartToCheckoutResume.ts - price no payload:", price);
      await createCartCheckoutResume(payload);
    },
    []
  );

  // Função para editar item (update)
  const edit = useCallback(
    async (item: { user_id: string; entry_id: string; quantity: number }) => {
      console.log(
        "🟡 [ShoppingCartToCheckoutResume] FUNÇÃO EDIT executada com item:",
        item
      );
      // Busca o registro do resumo pelo user_id e entry_id
      const resumes = (await getCartCheckoutResumeByUser(
        item.user_id
      )) as CartCheckoutResumeWithEntry[];
      const found = resumes?.find((r) => r.entry_id === item.entry_id);
      if (found) {
        await updateCartCheckoutResume(found.id, { quantity: item.quantity });
        console.log("ShoppingCartToCheckoutResume.ts - edit (update):", item);
      } else {
        console.warn("Resumo não encontrado para update", item);
      }
    },
    []
  );

  // Função para remover item (delete)
  const remove = useCallback(
    async (item: { user_id: string; entry_id: string }) => {
      console.log(
        "🔴 [ShoppingCartToCheckoutResume] FUNÇÃO REMOVE executada com item:",
        item
      );
      // Busca o registro do resumo pelo user_id e entry_id
      const resumes = (await getCartCheckoutResumeByUser(
        item.user_id
      )) as CartCheckoutResumeWithEntry[];
      const found = resumes?.find((r) => r.entry_id === item.entry_id);
      if (found) {
        await deleteCartCheckoutResume(found.id);
        console.log("ShoppingCartToCheckoutResume.ts - remove (delete):", item);
      } else {
        console.warn("Resumo não encontrado para delete", item);
      }
    },
    []
  );

  // Função para sincronizar preços quando value é atualizado
  const syncPriceFromValue = useCallback(async (entry_id: string) => {
    console.log(
      "🔵 [ShoppingCartToCheckoutResume] FUNÇÃO SYNCPRICEFROMVALUE executada com entry_id:",
      entry_id
    );
    try {
      // Busca os valores atualizados do entry_id
      const allEntryValues = await getFormEntryValuesByEntryId(entry_id);
      const filteredByEntryId = Array.isArray(allEntryValues)
        ? allEntryValues.filter((v) => v.entry_id === entry_id)
        : [];
      console.log("filteredByEntryId:", filteredByEntryId);

      // NOVA LÓGICA: Busca dados de preço considerando value_json e value
      // Prioriza promotional_price quando existir e for > 0
      let productData: any = null;
      let sourceInfo = "";

      // Primeiro, procura por dados de produto em value_json
      for (const item of filteredByEntryId) {
        if (item.value_json && typeof item.value_json === "object") {
          if (item.value_json.price || item.value_json.promotional_price) {
            productData = item.value_json;
            sourceInfo = "value_json";
            console.log(
              "🔍 [syncPriceFromValue] Dados encontrados em value_json:",
              productData
            );
            break;
          }
        }
      }

      // Se não encontrou em value_json, procura em value (JSON string)
      if (!productData) {
        for (const item of filteredByEntryId) {
          if (typeof item.value === "string") {
            try {
              const parsed = JSON.parse(item.value);
              if (
                parsed &&
                typeof parsed === "object" &&
                (parsed.price || parsed.promotional_price)
              ) {
                productData = parsed;
                sourceInfo = "value (JSON string)";
                console.log(
                  "🔍 [syncPriceFromValue] Dados encontrados em value:",
                  productData
                );
                break;
              }
            } catch {
              // Ignora erros de parse
            }
          }
        }
      }

      if (!productData) {
        console.warn(
          "syncPriceFromValue: Nenhum valor de preço encontrado para entry_id:",
          entry_id
        );
        return;
      }

      console.log(
        "📊 [syncPriceFromValue] Dados do produto origem:",
        sourceInfo
      );
      console.log("📊 [syncPriceFromValue] Dados do produto:", productData);

      let price = 0;
      try {
        console.log(
          "🔍 [syncPriceFromValue] productData.price:",
          productData.price
        );
        console.log(
          "🔍 [syncPriceFromValue] productData.promotional_price:",
          productData.promotional_price
        );

        // NOVA LÓGICA REFATORADA: prioriza promotional_price quando existir e for > 0
        let priceToUse = productData.price; // valor padrão

        // Verifica se promotional_price existe e é válido
        if (
          productData.promotional_price &&
          productData.promotional_price !== "" &&
          productData.promotional_price !== null &&
          productData.promotional_price !== undefined &&
          !isNaN(Number(productData.promotional_price)) &&
          Number(productData.promotional_price) > 0
        ) {
          // Se promotional_price tem valor válido e maior que 0, usa ele
          priceToUse = productData.promotional_price;
          console.log(
            "✅ [syncPriceFromValue] USANDO promotional_price:",
            productData.promotional_price
          );
        } else {
          // Se promotional_price está vazio/null/undefined/zero, usa price normal
          console.log(
            "⚠️ [syncPriceFromValue] USANDO price normal:",
            productData.price
          );
        }

        console.log("💰 [syncPriceFromValue] priceToUse final:", priceToUse);

        // Converte para número, removendo vírgula e pontos se necessário
        if (typeof priceToUse === "string") {
          console.log(
            "🔄 [syncPriceFromValue] Convertendo string para número:",
            priceToUse
          );
          const normalized = priceToUse
            .replace(/\./g, "")
            .replace(",", ".")
            .replace(/[^0-9.]/g, "");
          console.log("🔄 [syncPriceFromValue] Valor normalizado:", normalized);
          price = parseFloat(normalized);
          console.log("🔄 [syncPriceFromValue] Valor final parseado:", price);
        } else if (typeof priceToUse === "number") {
          console.log(
            "🔢 [syncPriceFromValue] Usando valor numérico direto:",
            priceToUse
          );
          price = priceToUse;
        }
        console.log("💯 [syncPriceFromValue] PRICE FINAL CALCULADO:", price);
      } catch (error) {
        console.error(
          "syncPriceFromValue: Erro ao fazer parse do value:",
          error
        );
        return;
      }

      console.log("syncPriceFromValue - novo preço calculado:", price);

      // Busca todos os registros de cart_checkout_resume que tenham esse entry_id
      const { data: resumesToUpdate, error: queryError } = await supabase
        .from("cart_checkout_resume")
        .select("*")
        .filter("entry_id", "eq", entry_id);

      if (queryError) {
        console.error(
          "syncPriceFromValue - erro ao buscar registros:",
          queryError
        );
        return;
      }

      console.log(
        "syncPriceFromValue - registros encontrados para atualizar:",
        resumesToUpdate
      );

      // Atualiza o preço em todos os registros encontrados
      for (const resume of resumesToUpdate || []) {
        await updateCartCheckoutResume(resume.id, { price });
        console.log(
          `syncPriceFromValue - preço atualizado para registro ${resume.id}:`,
          price
        );
      }

      // Dispara evento para recarregar as tabelas/componentes que dependem dos dados
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resume-table-reload"));
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (error) {
      console.error("syncPriceFromValue: Erro ao sincronizar preço:", error);
    }
  }, []);

  // Função para buscar itens
  const get = useCallback((user_id: string) => {
    console.log(
      "🟣 [ShoppingCartToCheckoutResume] FUNÇÃO GET executada com user_id:",
      user_id
    );
  }, []);

  return { add, edit, remove, get, syncPriceFromValue };
}
