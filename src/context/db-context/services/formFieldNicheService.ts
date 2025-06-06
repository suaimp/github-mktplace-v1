import { supabase } from "../../../lib/supabase";

export interface FormFieldNiche {
  id: string;
  form_field_id: string;
  niche: string;
  price: number | null;
  options: string[] | null;
  created_at: string;
  updated_at: string;
}

export type FormFieldNicheInput = {
  form_field_id: string;
  options: string[];
};

export async function getFormFieldNiches(): Promise<FormFieldNiche[] | null> {
  const { data, error } = await supabase.from("form_field_niche").select("*");
  if (error) {
    console.error("Erro ao buscar form_field_niche:", error);
    return null;
  }
  return data as FormFieldNiche[];
}

export async function getFormFieldNicheById(id: string): Promise<FormFieldNiche | null> {
  const { data, error } = await supabase
    .from("form_field_niche")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar form_field_niche por id:", error);
    return null;
  }
  return data as FormFieldNiche;
}

export async function getFormFieldNicheByFormFieldId(form_field_id: string): Promise<FormFieldNiche | null> {
  const { data, error } = await supabase
    .from("form_field_niche")
    .select("*")
    .eq("form_field_id", form_field_id)
    .maybeSingle();
  if (error) {
    console.error("Erro ao buscar form_field_niche por form_field_id:", error);
    return null;
  }
  return data as FormFieldNiche;
}

export async function createFormFieldNiche(input: FormFieldNicheInput): Promise<FormFieldNiche | null> {
  const { data, error } = await supabase
    .from("form_field_niche")
    .insert([input])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar form_field_niche:", error);
    return null;
  }
  return data as FormFieldNiche;
}

export async function updateFormFieldNiche(
  form_field_id: string,
  updates: Partial<FormFieldNicheInput>
): Promise<FormFieldNiche | null> {
  try {
    // Busca o primeiro registro com o form_field_id
    const { data: rows, error: fetchError } = await supabase
      .from("form_field_niche")
      .select("id, options")
      .eq("form_field_id", form_field_id)
      .limit(1);

    console.log("[updateFormFieldNiche] Encontrado:", rows);
    if (fetchError) {
      console.error("Erro ao buscar form_field_niche:", fetchError);
      throw fetchError;
    }

    if (rows && rows.length > 0) {
      console.log("[updateFormFieldNiche] Fazendo update para id:", rows[0].id, "com", updates);
      try {
        const { data, error } = await supabase
          .from("form_field_niche")
          .update(updates)
          .eq("id", rows[0].id)
          .select()
          .single();
        if (error) {
          console.error("Erro ao atualizar form_field_niche:", error);
          throw error;
        }
        console.log("[updateFormFieldNiche] Update result:", data);
        return data as FormFieldNiche;
      } catch (err) {
        console.error("[updateFormFieldNiche] CATCH update:", err);
        throw err;
      }
    }

    // Se não encontrou, retorna null para fazer o insert depois
    console.log("[updateFormFieldNiche] Nenhum registro encontrado para update, retornando null");
    return null;
  } catch (err) {
    console.error("Erro inesperado no updateFormFieldNiche:", err);
    throw err;
  }
}

export async function deleteFormFieldNiche(id: string): Promise<boolean> {
  const { error } = await supabase.from("form_field_niche").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar form_field_niche:", error);
    return false;
  }
  return true;
}
