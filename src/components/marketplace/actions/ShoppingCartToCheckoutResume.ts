import { useCallback } from "react";
import {
  createCartCheckoutResume,
  updateCartCheckoutResume,
  deleteCartCheckoutResume,
  getCartCheckoutResumeByUser
} from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";
import { getFormEntryValuesByEntryId } from "../../../services/db-services/form-services/formEntryValueService";
import { getPriceFromEntryWithCache } from "../../Checkout/utils/priceFromEntryUtils";
import { supabase } from "../../../lib/supabase";

// Adiciona entry_id na tipagem do CartCheckoutResume para facilitar buscas
export type CartCheckoutResumeWithEntry =
  import("../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService").CartCheckoutResume & {
    entry_id: string;
  };

export function useShoppingCartToCheckoutResume() {

  // Função para adicionar item ao checkout resume

  const add = useCallback(
    async (item: { user_id: string; entry_id: string; quantity: number }) => {

      // NOVA LÓGICA: Usa a função utilitária para buscar o preço correto
      const correctPrice = await getPriceFromEntryWithCache(item.entry_id);
      const price = correctPrice || 0; // fallback para 0 se não encontrar

      // Busca os valores do entry_id para outras informações (URL, nichos, etc.)
      const allEntryValues = await getFormEntryValuesByEntryId(item.entry_id);
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
      const onlyWithValueJson = Array.isArray(allEntryValues)
        ? allEntryValues.filter((v) => !!v.value_json)
        : [];
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
      const payload = {
        user_id: item.user_id,
        entry_id: item.entry_id,
        product_url: urlWithoutHttps,
        quantity: item.quantity,
        niche: JSON.stringify(nichesArray),
        price: price, // agora sempre number
        service_content: ""
      };
      await createCartCheckoutResume(payload);
    },
    []
  );

  // Função para editar item (update)
  const edit = useCallback(
    async (item: { user_id: string; entry_id: string; quantity: number }) => {

      // Remove todos os registros do entry_id desse usuário
      const resumes = (await getCartCheckoutResumeByUser(
        item.user_id
      )) as CartCheckoutResumeWithEntry[];
      const toRemove = resumes?.filter((r) => r.entry_id === item.entry_id) || [];
      for (const reg of toRemove) {
        await deleteCartCheckoutResume(reg.id);
      }
      // Insere duplicidades conforme a quantidade
      if (item.quantity > 0) {
        await duplicateCartCheckoutResumeEntries(item.user_id, item.entry_id, item.quantity);
      }
      // Não atualiza mais o campo quantity diretamente!
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
      // NOVA LÓGICA: Usa a função utilitária para buscar o preço correto
      const correctPrice = await getPriceFromEntryWithCache(entry_id);

      if (correctPrice === null) {
        console.warn(
          "syncPriceFromValue: Nenhum valor de preço encontrado para entry_id:",
          entry_id
        );
        return;
      }

      console.log(
        `[syncPriceFromValue] Preço correto obtido para entry_id ${entry_id}:`,
        correctPrice
      );

      // Busca o item no resumo para atualizar
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        console.warn("syncPriceFromValue: Usuário não autenticado");
        return;
      }

      const resumes = (await getCartCheckoutResumeByUser(
        user.id
      )) as CartCheckoutResumeWithEntry[];
      const resumeItem = resumes?.find((r) => r.entry_id === entry_id);

      if (resumeItem) {
        await updateCartCheckoutResume(resumeItem.id, {
          price: correctPrice
        });
        console.log(
          `[syncPriceFromValue] Preço atualizado no resumo para entry_id ${entry_id}: ${correctPrice}`
        );
      } else {
        console.warn(
          "syncPriceFromValue: Item não encontrado no resumo para entry_id:",
          entry_id
        );
      }
    } catch (error) {
      console.error("syncPriceFromValue: Erro:", error);
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

// Função utilitária para montar o payload do resumo do checkout
export async function buildCartCheckoutResumePayload(user_id: string, entry_id: string) {
  // Busca o preço correto
  const correctPrice = await getPriceFromEntryWithCache(entry_id);
  const price = correctPrice || 0;

  // Busca os valores do entry_id para outras informações (URL, nichos, etc.)
  const allEntryValues = await getFormEntryValuesByEntryId(entry_id);
  // Busca url https e remove https://
  const urlEntry = Array.isArray(allEntryValues)
    ? allEntryValues.find(
        (v) => typeof v.value === "string" && v.value.startsWith("https://")
      )
    : undefined;
  let urlWithoutHttps: string | null = null;
  if (urlEntry && typeof urlEntry.value === "string") {
    urlWithoutHttps = urlEntry.value.replace(/^https:\/\//, "");
  }
  const onlyWithValueJson = Array.isArray(allEntryValues)
    ? allEntryValues.filter((v) => !!v.value_json)
    : [];
  // Filtra apenas os que possuem value_json com algum item de array contendo campo niche
  const entryValues = onlyWithValueJson.filter(
    (v) =>
      v.entry_id === entry_id &&
      v.value_json &&
      (() => {
        try {
          const json =
            typeof v.value_json === "string"
              ? JSON.parse(v.value_json)
              : v.value_json;
          if (Array.isArray(json)) {
            return json.some(
              (el) => el && typeof el === "object" && "niche" in el
            );
          }
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
  return {
    user_id,
    entry_id,
    product_url: urlWithoutHttps,
    quantity: 1, // sempre 1 para duplicidade
    niche: JSON.stringify(nichesArray),
    price,
    service_content: ""
  };
}

// Função para inserir múltiplos registros duplicados conforme a quantidade
export async function duplicateCartCheckoutResumeEntries(user_id: string, entry_id: string, quantity: number) {
  const payload = await buildCartCheckoutResumePayload(user_id, entry_id);
  const inserts = Array.from({ length: quantity }, () => ({ ...payload }));
  // Remove o campo id se vier do tipo
  inserts.forEach((item) => { delete (item as any).id; });
  // Inserção em lote
  const { data, error } = await supabase
    .from("cart_checkout_resume")
    .insert(inserts);
  if (error) {
    console.error("Erro ao inserir duplicidades em cart_checkout_resume:", error.message);
    throw error;
  }
  return data;
}
