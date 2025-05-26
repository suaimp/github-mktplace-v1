import { supabase } from "../../../lib/supabase";

export interface FormEntry {
  id: string;
  form_id: string;
  user_id: string;
  data: any;
  created_at: string;
}

export async function getFormEntries() {
  const { data, error } = await supabase.from("form_entries").select("*");
  if (error) {
    console.log("Erro ao buscar form_entries:", error);
    return [];
  }
  return data as FormEntry[];
}
