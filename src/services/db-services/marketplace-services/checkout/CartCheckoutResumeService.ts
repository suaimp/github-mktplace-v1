import { supabase } from "../../../../lib/supabase";

export type CartCheckoutResume = {
  id: string;
  user_id: string;
  entry_id?: string; // Adicionado entry_id
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
  item_total?: number; // Adicionado para permitir update
};

export async function getCartCheckoutResumeByUser(
  userId: string
): Promise<CartCheckoutResume[] | null> {
  console.log("🔍 Buscando cart_checkout_resume para usuário:", userId);
  
  const { data, error } = await supabase
    .from("cart_checkout_resume")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erro ao buscar cart_checkout_resume:", error.message);
    return null;
  }
  
  console.log("✅ Dados retornados do banco:", data);
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
  updates: Partial<Omit<CartCheckoutResume, "id" | "created_at"> & { item_total?: number }>
): Promise<CartCheckoutResume | null> {
  console.log("🔄 Atualizando cart_checkout_resume:", {
    id: id,
    updates: updates
  });
  
  // Garante que niche_selected seja array de objeto se presente
  const updatesToSend = { ...updates };
  
  // Garante que service_selected seja um array válido
  if (updatesToSend.service_selected) {
    if (Array.isArray(updatesToSend.service_selected)) {
      // Garante que cada item do array seja um objeto válido
      updatesToSend.service_selected = updatesToSend.service_selected.map((service: any) => {
        if (typeof service === "string") {
          try {
            return JSON.parse(service);
          } catch {
            return { title: service };
          }
        }
        return service;
      });
    } else {
      console.warn("⚠️ service_selected não é um array, convertendo:", updatesToSend.service_selected);
      updatesToSend.service_selected = [updatesToSend.service_selected];
    }
  }
  
  console.log("📤 Dados sanitizados para envio:", updatesToSend);
  
  // Não faz conversão, pois já vem no formato correto
  return await (async () => {
    const { data, error } = await supabase
      .from("cart_checkout_resume")
      .update(updatesToSend)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("❌ Erro ao atualizar cart_checkout_resume:", error.message);
      return null;
    }
    
    console.log("✅ Dados atualizados com sucesso:", data);
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
