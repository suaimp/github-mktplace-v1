import { FormEntry, FormField, SearchableField } from "../types";
import { formatDate } from "../../../../form/utils/formatters";
import { extractPriceForSearch } from "./priceUtils";

/**
 * Converte o status para texto legível
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case "verificado":
      return "Verificado";
    case "reprovado":
      return "Reprovado";
    case "em_analise":
    default:
      return "Em Análise";
  }
};

/**
 * Cria campos pesquisáveis baseados nos campos do formulário
 */
export const createSearchableFields = (formFields: FormField[]): SearchableField[] => {
  const baseFields: SearchableField[] = [
    {
      key: 'created_at',
      label: 'Data de Criação',
      type: 'date',
      accessor: (entry: FormEntry) => {
        try {
          return formatDate(entry.created_at);
        } catch {
          return entry.created_at;
        }
      }
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      accessor: (entry: FormEntry) => getStatusText(entry.status)
    },
    {
      key: 'publisher_email',
      label: 'Publisher Email',
      type: 'email',
      accessor: (entry: FormEntry) => entry.publisher?.email || null
    },
    {
      key: 'publisher_name',
      label: 'Publisher Nome',
      type: 'text',
      accessor: (entry: FormEntry) => {
        const { publisher } = entry;
        if (!publisher) return null;
        
        // Combina first_name e last_name se existirem
        if (publisher.first_name || publisher.last_name) {
          return `${publisher.first_name || ''} ${publisher.last_name || ''}`.trim();
        }
        
        // Usa name se existir
        return publisher.name || null;
      }
    }
  ];

  // Adiciona campos dinâmicos do formulário
  const dynamicFields: SearchableField[] = formFields
    .filter(field => field.field_type !== "button_buy") // Excluir campos não pesquisáveis
    .map(field => ({
      key: field.id,
      label: field.label,
      type: field.field_type === 'product' ? 'price' : 'dynamic',
      accessor: (entry: FormEntry) => {
        const value = entry.values?.[field.id];
        if (value === null || value === undefined) return null;
        
        // Para campos de preço, extrai múltiplos formatos
        if (field.field_type === 'product') {
          const priceTexts = extractPriceForSearch(value);
          return priceTexts.length > 0 ? priceTexts.join(' ') : null;
        }
        
        return String(value);
      }
    }));

  return [...baseFields, ...dynamicFields];
};

/**
 * Normaliza texto para busca (remove acentos, converte para minúsculo)
 */
export const normalizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

/**
 * Verifica se um texto contém o termo de busca
 */
export const matchesSearchTerm = (
  text: string | null, 
  searchTerm: string, 
  exactMatch: boolean = false
): boolean => {
  if (!text || !searchTerm.trim()) return false;
  
  const normalizedText = normalizeSearchText(text);
  const normalizedTerm = normalizeSearchText(searchTerm.trim());
  
  if (exactMatch) {
    return normalizedText === normalizedTerm;
  }
  
  return normalizedText.includes(normalizedTerm);
};
