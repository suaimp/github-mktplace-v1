/**
 * Utilitário para determinar se o input de contagem de palavras deve ser exibido
 * Responsabilidade única: Lógica de exibição do input de palavras
 */

import { SERVICE_OPTIONS } from "../../constants/options";

/**
 * Determina se o input de contagem de palavras deve ser exibido
 * @param selected - Título do serviço selecionado (string ou null)
 * @param servicePackageArray - Array de pacotes de serviço
 * @returns boolean - true se deve exibir o input, false caso contrário
 */
export function shouldShowWordCountInput(
  selected: string | null,
  servicePackageArray: any[]
): boolean {
  // Não mostra o input se:
  // - Não há seleção
  // - Seleção é "Nenhum" ou similar
  // - Seleção é SERVICE_OPTIONS.NONE
  // - Seleção é o placeholder
  // - Array de pacotes está vazio
  if (
    !selected ||
    selected.trim().toLowerCase().startsWith("nenhum") ||
    selected === SERVICE_OPTIONS.NONE ||
    selected === SERVICE_OPTIONS.LEGACY_NONE ||
    selected === SERVICE_OPTIONS.PLACEHOLDER ||
    !servicePackageArray ||
    servicePackageArray.length === 0
  ) {
    return false;
  }
  
  return true;
}