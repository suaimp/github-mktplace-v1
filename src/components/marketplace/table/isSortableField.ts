// Utilitário para verificar se um campo é ordenável na tabela do marketplace

export function isSortableField(field: any): boolean {
  // Não ordena campos de ação/botão
  if (["button_buy", "actions", "modal", "checkbox"].includes(field.field_type)) {
    return false;
  }
  // Ordena todos os outros tipos
  return true;
}
