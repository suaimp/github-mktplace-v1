import { calculateProductPrice } from "../actions/priceCalculator";
import { MarketplaceEntry, SortableField, SortDirection } from "./types";

/**
 * Extrai o valor para ordenação de um campo específico
 * Trata campos de produto/preço de forma especial
 */
export function extractSortValue(
  entry: MarketplaceEntry,
  field: SortableField
): any {
  const rawValue = entry.values[field.id];
  
  // Para campos de produto, extrai o preço numérico
  if (field.field_type === "product") {
    try {
      return calculateProductPrice(rawValue);
    } catch (error) {
      console.error(`Error extracting price for sorting from field ${field.id}:`, error);
      return 0;
    }
  }
  
  // Para outros tipos de campo, retorna o valor bruto
  return rawValue;
}

/**
 * Compara dois valores para ordenação
 * Lida com números, strings e valores nulos/undefined
 */
export function compareValues(
  aValue: any,
  bValue: any,
  direction: SortDirection
): number {
  // Trata valores nulos/undefined
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return direction === "asc" ? -1 : 1;
  if (bValue == null) return direction === "asc" ? 1 : -1;

  // Converte para números se possível
  const aNum = Number(aValue);
  const bNum = Number(bValue);
  const aIsNum = !isNaN(aNum) && isFinite(aNum);
  const bIsNum = !isNaN(bNum) && isFinite(bNum);

  // Se ambos são números válidos
  if (aIsNum && bIsNum) {
    const diff = aNum - bNum;
    return direction === "asc" ? diff : -diff;
  }

  // Se apenas um é número, número vem primeiro na ordem ascendente
  if (aIsNum && !bIsNum) return direction === "asc" ? -1 : 1;
  if (!aIsNum && bIsNum) return direction === "asc" ? 1 : -1;

  // Para strings, usa localeCompare
  const aStr = String(aValue).toLowerCase();
  const bStr = String(bValue).toLowerCase();
  const comparison = aStr.localeCompare(bStr, 'pt-BR', { 
    numeric: true, 
    sensitivity: 'base' 
  });
  
  return direction === "asc" ? comparison : -comparison;
}

/**
 * Ordena uma lista de entradas baseada no campo e direção especificados
 */
export function sortEntries(
  entries: MarketplaceEntry[],
  field: SortableField,
  direction: SortDirection
): MarketplaceEntry[] {
  return [...entries].sort((a, b) => {
    const aValue = extractSortValue(a, field);
    const bValue = extractSortValue(b, field);
    
    return compareValues(aValue, bValue, direction);
  });
}
