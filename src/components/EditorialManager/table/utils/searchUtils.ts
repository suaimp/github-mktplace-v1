/**
 * Utilitários para busca em entradas de formulário
 * Centraliza a lógica de filtro de busca
 */

export interface SearchableEntry {
  values: Record<string, any>;
  status: string;
  created_at: string;
  publisher?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface SearchableField {
  id: string;
  field_type: string;
  label: string;
}

/**
 * Verifica se um campo é pesquisável
 */
export function isSearchableField(fieldType: string): boolean {
  const searchableTypes = ["text", "textarea", "email", "url"];
  return searchableTypes.includes(fieldType);
}

/**
 * Busca em campos do formulário
 */
export function matchFormFields(
  entry: SearchableEntry,
  searchTerm: string,
  fields: SearchableField[]
): boolean {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return Object.entries(entry.values).some(([fieldId, value]) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !isSearchableField(field.field_type)) return false;
    return String(value).toLowerCase().includes(lowerSearchTerm);
  });
}

/**
 * Busca em dados do publisher
 */
export function matchPublisher(
  entry: SearchableEntry,
  searchTerm: string
): boolean {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  if (!entry.publisher) return false;
  
  return (
    (`${entry.publisher.first_name || ''} ${entry.publisher.last_name || ''}`.toLowerCase().includes(lowerSearchTerm) ||
    (entry.publisher.email || '').toLowerCase().includes(lowerSearchTerm))
  );
}

/**
 * Busca em status
 */
export function matchStatus(
  entry: SearchableEntry,
  searchTerm: string
): boolean {
  return (entry.status || '').toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Busca em data de criação
 */
export function matchDate(
  entry: SearchableEntry,
  searchTerm: string
): boolean {
  return (entry.created_at || '').toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Busca em valores numéricos
 */
export function matchNumericValues(
  entry: SearchableEntry,
  searchTerm: string
): boolean {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return Object.values(entry.values).some((value) => {
    if (typeof value === 'number' || (!isNaN(Number(value)) && value !== null && value !== undefined)) {
      return String(value).toLowerCase().includes(lowerSearchTerm);
    }
    return false;
  });
}

/**
 * Função principal de busca que combina todos os critérios
 */
export function matchEntry(
  entry: SearchableEntry,
  searchTerm: string,
  fields: SearchableField[]
): boolean {
  return (
    matchFormFields(entry, searchTerm, fields) ||
    matchPublisher(entry, searchTerm) ||
    matchStatus(entry, searchTerm) ||
    matchDate(entry, searchTerm) ||
    matchNumericValues(entry, searchTerm)
  );
}
