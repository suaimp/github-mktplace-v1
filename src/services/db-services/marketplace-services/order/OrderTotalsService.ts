import { supabase } from "../../../../lib/supabase";

export interface OrderTotal {
  id: string;
  user_id: string;
  total_product_price: number;
  total_content_price: number;
  total_final_price: number;
  total_word_count: number;
  created_at: string;
  updated_at: string;
}

export async function getOrderTotalsByUser(
  user_id: string
): Promise<OrderTotal[] | null> {
  const { data, error } = await supabase
    .from("order_totals")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    return null;
  }
  return data as OrderTotal[];
}

export async function getOrderTotalById(
  id: string
): Promise<OrderTotal | null> {
  const { data, error } = await supabase
    .from("order_totals")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return null;
  }
  return data as OrderTotal;
}

export async function createOrderTotal(
  order: Omit<OrderTotal, "id" | "created_at" | "updated_at">
): Promise<OrderTotal | null> {
  const { data, error } = await supabase
    .from("order_totals")
    .insert([order])
    .select()
    .single();
  if (error) {
    return null;
  }
  // Dispara evento global para atualizar UI
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("order-totals-updated"));
  }
  return data as OrderTotal;
}

export async function updateOrderTotal(
  id: string,
  updates: Partial<Omit<OrderTotal, "id" | "created_at">>
): Promise<OrderTotal | null> {
  const { data, error } = await supabase
    .from("order_totals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return null;
  }
  // Dispara evento global para atualizar UI
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("order-totals-updated"));
  }
  return data as OrderTotal;
}

export async function deleteOrderTotal(id: string): Promise<boolean> {
  const { error } = await supabase.from("order_totals").delete().eq("id", id);
  if (error) {
    return false;
  }
  return true;
}
