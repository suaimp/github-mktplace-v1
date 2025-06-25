import { supabase } from "../../../../lib/supabase";

export interface ShoppingCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export async function getShoppingCartItemsByUser() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return [];
  const { data, error } = await supabase
    .from("shopping_cart_items")
    .select("*")
    .eq("user_id", user.id);
  if (error) return [];
  return data as ShoppingCartItem[];
}

//não é aqui que estamos inserindo o item no carrinho.
export async function addShoppingCartItem(
  item: Omit<ShoppingCartItem, "id" | "created_at" | "user_id">
) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const { data, error } = await supabase
    .from("shopping_cart_items")
    .insert([{ ...item, user_id: user.id }])
    .select()
    .single();
  if (error) return null;

  return data as ShoppingCartItem;
}

export async function updateShoppingCartItem(
  id: string,
  updates: Partial<Omit<ShoppingCartItem, "id" | "user_id" | "created_at">>
) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const { data, error } = await supabase
    .from("shopping_cart_items")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) return null;
  return data as ShoppingCartItem;
}

export async function deleteShoppingCartItem(id: string) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) return false;
  const { error } = await supabase
    .from("shopping_cart_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  return !error;
}
