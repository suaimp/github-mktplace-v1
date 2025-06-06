import { supabase } from "../../../lib/supabase";
import type { Form } from "../DataContext";

export async function getForms(): Promise<Form[] | null> {
  const { data, error } = await supabase.from("forms").select("*");
  if (error) {
    console.error("Erro ao buscar forms:", error);
    return null;
  }
  return data as Form[];
}

export async function getFormById(id: string): Promise<Form | null> {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar form por id:", error);
    return null;
  }
  return data as Form;
}

export async function createForm(form: Omit<Form, "id">): Promise<Form | null> {
  const { data, error } = await supabase
    .from("forms")
    .insert([form])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar form:", error);
    return null;
  }
  return data as Form;
}

export async function updateForm(
  id: string,
  updates: Partial<Form>
): Promise<Form | null> {
  const { data, error } = await supabase
    .from("forms")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Erro ao atualizar form:", error);
    return null;
  }
  return data as Form;
}

export async function deleteForm(id: string): Promise<boolean> {
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar form:", error);
    return false;
  }
  return true;
}
