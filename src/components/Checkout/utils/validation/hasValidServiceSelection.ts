/**
 * Utilitário para validar se um item tem uma seleção de serviço válida
 * Responsabilidade única: Validação de seleção de serviços
 */

import { SERVICE_OPTIONS } from "../../constants/options";

/**
 * Verifica se um item tem uma seleção de serviço válida
 * @param item - Item do checkout
 * @param selectedService - Estado local de serviços selecionados
 * @returns boolean - true se há seleção válida, false caso contrário
 */
export function hasValidServiceSelection(
  item: any,
  selectedService: { [id: string]: string }
): boolean {
  // Primeiro verifica se há seleção no estado local
  const localSelection = selectedService[item.id];
  if (localSelection && localSelection !== SERVICE_OPTIONS.PLACEHOLDER) {
    return true;
  }

  // Se não há seleção local, verifica o valor do banco
  const preset = item.service_selected;
  
  // Se é null, undefined ou string vazia, não há seleção válida
  if (preset === null || preset === undefined || preset === "") {
    return false;
  }
  
  // Se é SERVICE_OPTIONS.NONE vindo apenas do banco (sem seleção consciente), não é válido
  if (typeof preset === "string") {
    if (preset === SERVICE_OPTIONS.NONE || preset === SERVICE_OPTIONS.LEGACY_NONE) {
      return false;
    }
    
    try {
      const parsed = JSON.parse(preset);
      if (parsed && typeof parsed === "object" && "title" in parsed) {
        return parsed.title !== SERVICE_OPTIONS.NONE && parsed.title !== SERVICE_OPTIONS.LEGACY_NONE;
      }
      return true;
    } catch {
      return true;
    }
  }
  
  // Se é array
  if (Array.isArray(preset) && preset.length > 0) {
    const first = preset[0];
    if (typeof first === "string") {
      if (first === SERVICE_OPTIONS.NONE || first === SERVICE_OPTIONS.LEGACY_NONE) {
        return false;
      }
      
      try {
        const parsed = JSON.parse(first);
        if (parsed && typeof parsed === "object" && "title" in parsed) {
          return parsed.title !== SERVICE_OPTIONS.NONE && parsed.title !== SERVICE_OPTIONS.LEGACY_NONE;
        }
        return true;
      } catch {
        return true;
      }
    } else if (typeof first === "object" && first !== null && "title" in first) {
      return first.title !== SERVICE_OPTIONS.NONE && first.title !== SERVICE_OPTIONS.LEGACY_NONE;
    }
  }
  
  // Se é objeto
  if (typeof preset === "object" && preset !== null && "title" in preset) {
    return (preset as any).title !== SERVICE_OPTIONS.NONE && (preset as any).title !== SERVICE_OPTIONS.LEGACY_NONE;
  }
  
  return false;
}
