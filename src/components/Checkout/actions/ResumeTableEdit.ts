import { useState } from "react";
import { updateCartCheckoutResume } from "../../../context/db-context/services/CartCheckoutResumeService";

export function useResumeTableEdit() {
  const [loadingItem, setLoadingItem] = useState<{ [id: string]: boolean }>({});

  // Atualiza quantidade localmente e no banco
  async function handleQuantityChange(
    item: any,
    value: number,
    setResumeData: (fn: (prev: any[]) => any[]) => void
  ) {
    setResumeData((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, quantity: value } : row
      )
    );
  }

  // Persiste no banco ao sair do campo
  async function handleQuantityBlur(item: any, quantity: number) {
    setLoadingItem((prev) => ({ ...prev, [item.id]: true }));
    try {
      await updateCartCheckoutResume(item.id, { quantity });
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
    ) => void
  ) {
    // Atualiza apenas o nome do nicho no estado local (UI)
    setSelectedNiches((prev) => ({
      ...prev,
      [item.id]: value[0]?.niche || ""
    }));
    try {
      // Envia array de objeto para o backend
      await updateCartCheckoutResume(item.id, { niche_selected: value });
    } catch (err) {
      console.error("Erro ao atualizar niche_selected", err);
    }
  }

  return {
    loadingItem,
    handleQuantityChange,
    handleQuantityBlur,
    handleNicheChange
  };
}
