import {
  updateOrderTotal,
  createOrderTotal
} from "../../../context/db-context/services/OrderTotalsService";
import { supabase } from "../../../lib/supabase";

// Cache para evitar múltiplas operações simultâneas para o mesmo usuário
const pendingOperations = new Map<string, Promise<number>>();

export async function calculateTotal(
  totalFinalArray: any[],
  totalProductArray?: any[],
  totalContentArray?: any[],
  totalWordCountArray?: any[]
): Promise<number> {
  if (
    !totalFinalArray ||
    !Array.isArray(totalFinalArray) ||
    totalFinalArray.length === 0
  ) {
    // Apenas calcula e retorna, não envia ao banco
    return 0;
  }

  const somaFinal = totalFinalArray.reduce(
    (acc, curr) => acc + Number(curr),
    0
  );
  const somaProduct = totalProductArray
    ? totalProductArray.reduce((acc, curr) => acc + Number(curr), 0)
    : somaFinal;
  const somaContent = totalContentArray
    ? totalContentArray.reduce((acc, curr) => acc + Number(curr), 0)
    : 0;
  const somaWordCount = totalWordCountArray
    ? totalWordCountArray.reduce((acc, curr) => acc + Number(curr || 0), 0)
    : 0;

  // Obter o usuário logado
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Verificar se já há uma operação pendente para este usuário
  if (pendingOperations.has(user.id)) {
    return await pendingOperations.get(user.id)!;
  }

  // Criar promessa para esta operação
  const operation = performCalculation(
    user.id,
    somaProduct,
    somaContent,
    somaFinal,
    somaWordCount
  );
  pendingOperations.set(user.id, operation);

  try {
    const result = await operation;
    return result;
  } finally {
    // Limpar a operação pendente após completar
    pendingOperations.delete(user.id);
  }
}

async function performCalculation(
  userId: string,
  somaProduct: number,
  somaContent: number,
  somaFinal: number,
  somaWordCount: number
): Promise<number> {
  try {
    // Usar upsert para garantir apenas um registro por usuário
    const { error } = await supabase
      .from("order_totals")
      .upsert(
        {
          user_id: userId,
          total_product_price: somaProduct,
          total_content_price: somaContent,
          total_final_price: somaFinal,
          total_word_count: somaWordCount,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Erro no upsert de order_totals:", error);

      // Fallback: tentar buscar e atualizar manualmente
      const { data: existingData } = await supabase
        .from("order_totals")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingData) {
        // Atualizar registro existente
        await updateOrderTotal(existingData.id, {
          user_id: userId,
          total_product_price: somaProduct,
          total_content_price: somaContent,
          total_final_price: somaFinal,
          total_word_count: somaWordCount
        });
      } else {
        // Criar novo registro
        await createOrderTotal({
          user_id: userId,
          total_product_price: somaProduct,
          total_content_price: somaContent,
          total_final_price: somaFinal,
          total_word_count: somaWordCount
        });
      }
    } else {
      // Disparar evento global para atualizar UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("order-totals-updated"));
      }
    }

    return somaFinal;
  } catch (error) {
    console.error("Erro em performCalculation:", error);
    return somaFinal;
  }
}
