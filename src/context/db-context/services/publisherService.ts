import { supabase } from "../../../lib/supabase";

// Services para publishers

export interface PublisherService {
  id: string;
  current_id: string;
  service_title: string;
  service_type: string;
  product_type: string; // uuid do form relacionado
  created_at: string;
  updated_at: string;
}

export async function getPublisherServices(): Promise<
  PublisherService[] | null
> {
  const { data, error } = await supabase.from("publisher_services").select("*");

  if (error) {
    console.error("Erro ao buscar publisher_services:", error);
    return null;
  }
  return data as PublisherService[];
}

export async function getPublisherServiceById(
  id: string
): Promise<PublisherService | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar publisher_service por id:", error);
    return null;
  }
  return data as PublisherService;
}

export async function createPublisherService(
  service: Omit<PublisherService, "id" | "created_at" | "updated_at">
): Promise<PublisherService | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .insert([service])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar publisher_service:", error);
    return null;
  }
  return data as PublisherService;
}

export async function updatePublisherService(
  id: string,
  updates: Partial<PublisherService>
): Promise<PublisherService | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Erro ao atualizar publisher_service:", error);
    return null;
  }
  return data as PublisherService;
}

export async function deletePublisherService(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("publisher_services")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Erro ao deletar publisher_service:", error);
    return false;
  }
  return true;
}
