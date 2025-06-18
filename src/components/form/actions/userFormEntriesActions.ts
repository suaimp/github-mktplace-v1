/**
 * Ações e filtros para UserFormEntriesRenderer
 * Gerencia a lógica de filtragem e processamento de dados para exibição de entradas do usuário
 */

export interface FilteredField {
  id: string;
  label: string;
  field_type: string;
  position: number;
  form_field_settings?: any;
}

export interface ProcessedEntry {
  id: string;
  created_at: string;
  status: string;
  created_by: string;
  publisher?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  values: Record<string, any>;
  notes?: any[];
}

/**
 * Filtra os campos para exibir apenas os necessários na tabela:
 * - Data (created_at - gerado automaticamente)
 * - URL do Site (campo do tipo 'url')
 * - Publisher (gerado automaticamente baseado no usuário)
 * - Status (gerado automaticamente)
 * - Ações (gerado automaticamente)
 */
export function filterFieldsForTable(fields: any[]): FilteredField[] {
  return fields.filter((field) => {
    // Apenas campos do tipo URL são necessários para a tabela
    // Os outros campos (Data, Publisher, Status, Ações) são gerados automaticamente
    return field.field_type === "url";
  });
}

/**
 * Filtra os campos visíveis baseado nas configurações de visibilidade e permissões do usuário
 */
export function filterVisibleFields(fields: any[], isAdmin: boolean): any[] {
  return fields.filter((field) => {
    const settings = field.form_field_settings;

    // Se não há configurações, mostrar o campo
    if (!settings) return true;

    // Esconder campos com visibility = 'hidden'
    if (settings.visibility === "hidden") return false;

    // Esconder campos admin-only para usuários não-admin
    if (settings.visibility === "admin" && !isAdmin) return false;

    // Esconder campos marketplace-only para usuários não-admin
    if (settings.visibility === "marketplace" && !isAdmin) return false;

    return true;
  });
}

/**
 * Processa as entradas para garantir que todos os dados necessários estão presentes
 */
export function processEntriesForTable(entries: any[]): ProcessedEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    created_at: entry.created_at,
    status: entry.status,
    created_by: entry.created_by,
    publisher: entry.publisher,
    values: entry.values || {},
    notes: entry.notes || []
  }));
}

/**
 * Identifica campos do tipo URL para renderização especial
 */
export function getUrlFields(fields: any[]): string[] {
  return fields
    .filter((field) => field.field_type === "url")
    .map((field) => field.id);
}

/**
 * Cria um mapa de configurações dos campos para acesso rápido
 */
export function createFieldSettingsMap(fields: any[]): Record<string, any> {
  const settingsMap: Record<string, any> = {};

  fields.forEach((field) => {
    if (field.form_field_settings) {
      settingsMap[field.id] = field.form_field_settings;
    }
  });

  return settingsMap;
}

/**
 * Verifica se um campo deve ser exibido na edição baseado nas permissões
 */
export function shouldShowFieldInEdit(field: any, isAdmin: boolean): boolean {
  const settings = field.form_field_settings;

  if (!settings) return true;

  // Não mostrar campos admin-only para usuários regulares
  if (settings.visibility === "admin" && !isAdmin) {
    return false;
  }

  // Não mostrar campos marketplace-only para usuários regulares
  if (settings.visibility === "marketplace" && !isAdmin) {
    return false;
  }

  return true;
}
