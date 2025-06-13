import { supabase } from "../../../lib/supabase";

export interface FormEntryValue {
  id: string;
  entry_id: string;
  field_id: string;
  value: string | null;
  value_json: any;
  created_at: string;
}

/**
 * Busca todos os valores de um entry específico
 */
export async function getFormEntryValuesByEntryId(
  entryId: string
): Promise<FormEntryValue[]> {
  try {
    const { data, error } = await supabase
      .from("form_entry_values")
      .select("*")
      .eq("entry_id", entryId);

    if (error) {
      console.error(
        "formEntryValueService.ts - Error fetching entry values:",
        error
      );
      return [];
    }

    console.log("formEntryValueService.ts - Entry values found:", data);
    return data as FormEntryValue[];
  } catch (error) {
    console.error(
      "formEntryValueService.ts - Exception in getFormEntryValuesByEntryId:",
      error
    );
    return [];
  }
}
