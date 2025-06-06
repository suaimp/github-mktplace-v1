import { supabase } from "../../../lib/supabase";

// Busca valores da tabela form_entry_values por entry_id
export async function getFormEntryValuesByEntryId(entryId: string) {
  const { data, error } = await supabase
    .from("form_entry_values")
    .select("*")
    .eq("entry_id", entryId);

  if (error) {
    throw error;
  }
  return data;
}

// Busca todos os valores da tabela form_entry_values
export async function getAllFormEntryValues() {
  const { data, error } = await supabase.from("form_entry_values").select("*");

  if (error) {
    throw error;
  }
  return data;
}
