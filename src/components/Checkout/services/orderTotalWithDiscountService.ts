import { supabase } from "../../../lib/supabase";

interface OrderTotalData {
  user_id: string;
  total_product_price: number;
  total_content_price: number;
  total_final_price: number;
  total_word_count: number;
  applied_coupon_id?: string | null;
  discount_value?: number;
}

/**
 * Salva ou atualiza o total final do pedido com desconto aplicado
 */
export async function saveOrderTotalWithDiscount(
  totalProductPrice: number,
  totalContentPrice: number,
  totalFinalPrice: number,
  totalWordCount: number,
  discountValue: number = 0,
  couponId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Obter o usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Calcular o valor final com desconto
    const finalPriceWithDiscount = Math.max(totalFinalPrice - discountValue, 0);

    // Primeiro, tentar buscar se já existe um registro para este usuário
    const { data: existingRecord } = await supabase
      .from("order_totals")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const recordData: Omit<OrderTotalData, "user_id"> & { user_id: string; updated_at: string } = {
      user_id: user.id,
      total_product_price: totalProductPrice,
      total_content_price: totalContentPrice,
      total_final_price: finalPriceWithDiscount,
      total_word_count: totalWordCount,
      applied_coupon_id: couponId || null,
      discount_value: discountValue,
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingRecord) {
      // Atualizar registro existente
      console.log("🔄 [ORDER TOTALS WITH DISCOUNT] Atualizando registro existente:", existingRecord.id);
      result = await supabase
        .from("order_totals")
        .update(recordData)
        .eq("id", existingRecord.id)
        .select()
        .single();
    } else {
      // Inserir novo registro
      console.log("➕ [ORDER TOTALS WITH DISCOUNT] Criando novo registro");
      result = await supabase
        .from("order_totals")
        .insert(recordData)
        .select()
        .single();
    }

    if (result.error) {
      console.error("❌ [ORDER TOTALS WITH DISCOUNT] Erro ao salvar:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log("✅ [ORDER TOTALS WITH DISCOUNT] Totais salvos com desconto:", {
      originalTotal: totalFinalPrice,
      discountValue,
      finalPriceWithDiscount,
      couponId
    });

    // Disparar evento de atualização
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("order-totals-updated"));
    }

    return { success: true };
  } catch (error) {
    console.error("❌ [ORDER TOTALS WITH DISCOUNT] Erro inesperado:", error);
    return { success: false, error: "Erro inesperado ao salvar totais" };
  }
}
