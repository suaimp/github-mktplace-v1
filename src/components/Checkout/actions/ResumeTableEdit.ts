import { useState } from "react";
import { updateCartCheckoutResume } from "../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";
 

export function useResumeTableEdit() {
  const [loadingItem, setLoadingItem] = useState<{ [id: string]: boolean }>({});

  // Atualiza quantidade localmente e no banco
  async function handleQuantityChange(
    item: any,
    value: number,
    setResumeData: (fn: (prev: any[]) => any[]) => void,
    context: any
  ) {
    setResumeData((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, quantity: value } : row
      )
    );
    // Use o valor total passado pelo contexto (totalsMap[item.id])
    const item_total = context.item_total;
    await updateCartCheckoutResume(item.id, { quantity: value, item_total });
  }

  // Persiste no banco ao sair do campo
  async function handleQuantityBlur(item: any, quantity: number, context: any) {
    setLoadingItem((prev) => ({ ...prev, [item.id]: true }));
    try {
      const item_total = context.item_total;
      await updateCartCheckoutResume(item.id, { quantity, item_total });
    } catch (err) {
      // Pode adicionar feedback de erro se desejar
      console.error("Erro ao atualizar quantidade", err);
    } finally {
      setLoadingItem((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  // Atualiza o nicho selecionado localmente e no banco
  async function handleNicheChange(
    item: any,
    value: { niche: string; price: string }[],
    setSelectedNiches: (
      fn: (prev: { [id: string]: string }) => { [id: string]: string }
    ) => void,
    context: any
  ) {
    // Atualiza apenas o nome do nicho no estado local (UI)
    setSelectedNiches((prev) => ({
      ...prev,
      [item.id]: value[0]?.niche || ""
    }));
    try {
      const item_total = context.item_total;
      // Envia array de objeto para o backend
      await updateCartCheckoutResume(item.id, { niche_selected: value, item_total });
    } catch (err) {
      console.error("Erro ao atualizar niche_selected", err);
    }
  }

  // Atualiza o valor personalizado de palavras no banco de dados
  async function handleWordCountChange(
    item: any,
    wordCount: number,
    currentServiceSelected: any[],
    context: any
  ) {
    console.log("🔧 handleWordCountChange chamada:", {
      itemId: item.id,
      wordCount: wordCount,
      currentServiceSelected: currentServiceSelected
    });
    
    setLoadingItem((prev) => ({ ...prev, [item.id]: true }));
    try {
      // Garante que currentServiceSelected seja um array válido
      let serviceArray = currentServiceSelected;
      
      // Se currentServiceSelected não for um array válido, cria um array padrão
      if (!Array.isArray(serviceArray) || serviceArray.length === 0) {
        console.warn("⚠️ currentServiceSelected não é um array válido, criando array padrão");
        serviceArray = [{
          title: "Nenhum",
          price: 0,
          price_per_word: 0,
          word_count: wordCount,
          is_free: true,
          benefits: []
        }];
      } else {
        // Atualiza o service_selected com o novo word_count personalizado
        serviceArray = currentServiceSelected.map((service: any) => {
          // Garante que service seja um objeto válido
          if (typeof service === "string") {
            try {
              service = JSON.parse(service);
            } catch {
              service = { title: service };
            }
          }
          
          return {
            title: service.title || "Nenhum",
            price: service.price || 0,
            price_per_word: service.price_per_word || 0,
            word_count: wordCount,
            is_free: service.is_free !== undefined ? service.is_free : true,
            benefits: service.benefits || []
          };
        });
      }

      console.log("📝 Atualizando service_selected:", {
        itemId: item.id,
        updatedServiceSelected: serviceArray
      });

      // Use o valor total passado pelo contexto (totalsMap[item.id])
      const item_total = context.item_total;
      const result = await updateCartCheckoutResume(item.id, {
        service_selected: serviceArray,
        item_total
      });
      
      console.log("✅ Resultado da atualização:", result);
      
      return result;
    } catch (err) {
      console.error("❌ Erro ao atualizar word_count personalizado", err);
      throw err;
    } finally {
      setLoadingItem((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  return {
    loadingItem,
    handleQuantityChange,
    handleQuantityBlur,
    handleNicheChange,
    handleWordCountChange
  };
}
