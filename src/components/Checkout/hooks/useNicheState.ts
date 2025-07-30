import { useState, useCallback } from "react";
import { NicheInitializationService, CartItem } from "../services/NicheInitializationService";
import { NICHE_OPTIONS } from "../constants/options";

export interface UseNicheStateReturn {
  selectedNiches: { [id: string]: string };
  initializeNiches: (cartItems: CartItem[]) => void;
  updateNiche: (itemId: string, nicheValue: string) => void;
  setSelectedNiches: React.Dispatch<React.SetStateAction<{ [id: string]: string }>>;
}

/**
 * Hook responsável pelo gerenciamento do estado dos nichos selecionados
 * Mantém a responsabilidade única de gerenciar apenas o estado
 */
export function useNicheState(): UseNicheStateReturn {
  const [selectedNiches, setSelectedNiches] = useState<{ [id: string]: string }>({});

  /**
   * Inicializa os nichos a partir dos dados do carrinho
   */
  const initializeNiches = useCallback((cartItems: CartItem[]) => {
    const initializedNiches = NicheInitializationService.initializeNichesFromCartData(cartItems);
    setSelectedNiches(initializedNiches);
  }, []);

  /**
   * Atualiza o nicho de um item específico
   */
  const updateNiche = useCallback((itemId: string, nicheValue: string) => {
    setSelectedNiches(prev => ({
      ...prev,
      [itemId]: nicheValue || NICHE_OPTIONS.PLACEHOLDER
    }));
  }, []);

  return {
    selectedNiches,
    initializeNiches,
    updateNiche,
    setSelectedNiches
  };
}
