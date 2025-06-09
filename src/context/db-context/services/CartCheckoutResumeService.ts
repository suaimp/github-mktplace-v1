import { supabase } from "../../../lib/supabase";

export type CartCheckoutResume = {
  id: string;
  user_id: string;
  product_url: string | null;
  quantity: number;
  niche: string | null;
  price: number;
  service_content: string;
  created_at: string;
  niche_selected?: { niche: string; price: string }[] | null;
  service_selected?:
    | {
        title: string;
        price: number;
        price_per_word: number;
        word_count: number;
        is_free: boolean;
      }[]
    | null;
};

export async function getCartCheckoutResumeByUser(
  userId: string
): Promise<CartCheckoutResume[] | null> {
  console.log(
    "getCartCheckoutResumeByUser: Buscando cart items para user_id:",
    userId
  );

  const { data, error } = await supabase
    .from("cart_checkout_resume")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  console.log("getCartCheckoutResumeByUser: Resultado da busca:", data);
  console.log("getCartCheckoutResumeByUser: Erro da busca:", error);

  if (error) {
    console.error("Erro ao buscar cart_checkout_resume:", error.message);
    return null;
  }
  return data as CartCheckoutResume[];
}

export async function getCartCheckoutResumeById(
  id: string
): Promise<CartCheckoutResume | null> {
  const { data, error } = await supabase
    .from("cart_checkout_resume")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar cart_checkout_resume por id:", error.message);
    return null;
  }
  return data as CartCheckoutResume;
}

export async function createCartCheckoutResume(
  payload: Omit<CartCheckoutResume, "id" | "created_at" | "cart_item_id"> & {
    cart_item_id?: string;
  }
): Promise<CartCheckoutResume | null> {
  const { data, error } = await supabase
    .from("cart_checkout_resume")
    .insert([{ ...payload }])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar cart_checkout_resume:", error.message);
    return null;
  }
  return data as CartCheckoutResume;
}

export async function updateCartCheckoutResume(
  id: string,
  updates: Partial<Omit<CartCheckoutResume, "id" | "created_at">>
): Promise<CartCheckoutResume | null> {
  // Garante que niche_selected seja array de objeto se presente
  const updatesToSend = { ...updates };
  // Não faz conversão, pois já vem no formato correto
  return await (async () => {
    const { data, error } = await supabase
      .from("cart_checkout_resume")
      .update(updatesToSend)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Erro ao atualizar cart_checkout_resume:", error.message);
      return null;
    }
    return data as CartCheckoutResume;
  })();
}

export async function deleteCartCheckoutResume(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("cart_checkout_resume")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Erro ao deletar cart_checkout_resume:", error.message);
    return false;
  }
  return true;
}
