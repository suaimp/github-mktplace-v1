import { supabase } from "../../../lib/supabase";

// Services para service cards

export interface ServiceCard {
  id: string;
  service_id: string;
  title: string;
  subtitle: string | null;
  price: number;
  price_per_word: number;
  word_count: number;
  benefits: string[];
  not_benefits: string[];
  period: string;
  created_at: string;
  updated_at: string;
}

export async function getServiceCards(): Promise<ServiceCard[] | null> {
  const { data, error } = await supabase.from("service_cards").select("*");
  if (error) {
    console.error("Erro ao buscar service_cards:", error);
    return null;
  }
  return data as ServiceCard[];
}

export async function getServiceCardById(
  id: string
): Promise<ServiceCard | null> {
  const { data, error } = await supabase
    .from("service_cards")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar service_card por id:", error);
    return null;
  }
  return data as ServiceCard;
}

export async function createServiceCard(
  service: Omit<ServiceCard, "id" | "created_at" | "updated_at">
): Promise<ServiceCard | null> {
  const { data, error } = await supabase
    .from("service_cards")
    .insert([service])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar service_card:", error);
    return null;
  }
  return data as ServiceCard;
}

export async function updateServiceCard(
  id: string,
  updates: Partial<Omit<ServiceCard, "id" | "created_at" | "updated_at">>
): Promise<ServiceCard | null> {
  const { data, error } = await supabase
    .from("service_cards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Erro ao atualizar service_card:", error);
    return null;
  }
  return data as ServiceCard;
}

export async function deleteServiceCard(id: string): Promise<boolean> {
  const { error } = await supabase.from("service_cards").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar service_card:", error);
    return false;
  }
  return true;
}
