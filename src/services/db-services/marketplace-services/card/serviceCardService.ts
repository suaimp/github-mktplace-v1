import { supabase } from "../../../../lib/supabase";

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
  is_free: boolean;
  updated_at: string;
}

export async function getServiceCards(): Promise<ServiceCard[] | null> {
  const { data, error } = await supabase
    .from("service_cards")
    .select(
      `
      id,
      service_id,
      title,
      subtitle,
      price,
      price_per_word,
      word_count,
      benefits,
      not_benefits,
      period,
      is_free,
      updated_at,
      layout_toggle
    `
    )
    .order("order_layout", { ascending: true });
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

// Atualiza a ordem dos cards no banco de dados
export async function updateCardsOrder(
  cards: { id: string; order_layout: number }[]
) {
  // Supondo que você use Supabase
  const updates = cards.map((card) =>
    supabase
      .from("service_cards")
      .update({ order_layout: card.order_layout })
      .eq("id", card.id)
  );
  await Promise.all(updates);
}

// Novo: Atualiza o valor do toggle/layout do card
export async function updateServiceCardToggle(
  id: string,
  layout_toggle: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from("service_cards")
    .update({ layout_toggle })
    .eq("id", id);
  if (error) {
    console.error("Erro ao atualizar layout_toggle do service_card:", error);
    return false;
  }
  return true;
}

// Novo: Busca o valor do toggle/layout do card
export async function getServiceCardToggle(
  id: string
): Promise<boolean | null> {
  const { data, error } = await supabase
    .from("service_cards")
    .select("layout_toggle")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar layout_toggle do service_card:", error);
    return null;
  }
  return data?.layout_toggle ?? null;
}
