import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export type CartCheckoutResume = {
  id: string;
  user_id: string;
  cart_item_id: string;
  entry_id: string | null;
  product_url: string | null;
  quantity: number;
  niche: string | null;
  price: number;
  redacao: boolean;
  created_at: string;
};

export async function getCartCheckoutResumeByUser(
  userId: string
): Promise<CartCheckoutResume[] | null> {
  const { data, error } = await supabase
    .from("cart_checkout_resume")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar cart_checkout_resume:", error.message);
    return null;
  }
  return data as CartCheckoutResume[];
}
