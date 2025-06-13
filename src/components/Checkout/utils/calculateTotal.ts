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
    console.log("📊 [CALCULATE TOTAL] Salvando totais:", {
      userId,
      somaProduct,
      somaContent,
      somaFinal,
      somaWordCount
    });

    // Primeiro, tentar buscar se já existe um registro para este usuário
    const { data: existingRecord } = await supabase
      .from("order_totals")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const recordData = {
      user_id: userId,
      total_product_price: somaProduct,
      total_content_price: somaContent,
      total_final_price: somaFinal,
      total_word_count: somaWordCount,
      updated_at: new Date().toISOString()
    };

    let result;

    if (existingRecord) {
      // Atualizar registro existente
      console.log(
        "🔄 [ORDER TOTALS] Atualizando registro existente:",
        existingRecord.id
      );
      result = await supabase
        .from("order_totals")
        .update(recordData)
        .eq("id", existingRecord.id)
        .select()
        .single();
    } else {
      // Inserir novo registro
      console.log("➕ [ORDER TOTALS] Criando novo registro");
      result = await supabase
        .from("order_totals")
        .insert(recordData)
        .select()
        .single();
    }

    const { error } = result;

    if (error) {
      console.error("❌ [ORDER TOTALS] Erro ao salvar:", error);
      throw error;
    } else {
      console.log("✅ [ORDER TOTALS] Totais salvos com sucesso");

      // Disparar evento global para atualizar UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("order-totals-updated"));
      }
    }

    return somaFinal;
  } catch (error) {
    console.error("❌ [CALCULATE TOTAL] Erro em performCalculation:", error);
    return somaFinal;
  }
}
