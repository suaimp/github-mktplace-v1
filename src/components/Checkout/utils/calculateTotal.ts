import { updateOrderTotal } from "../../../context/db-context/services/OrderTotalsService";
import { supabase } from "../../../lib/supabase";

export async function calculateTotal(arr: any[]) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    // Apenas calcula e retorna, não envia ao banco
    console.log("Array vazio ou inválido.");
    return 0;
  } else {
    const soma = arr.reduce((acc, curr) => acc + Number(curr), 0);
    console.log("Valores do array:", arr);
    console.log("Soma total:", soma);

    // Obter o usuário logado
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    // Buscar o único registro do usuário
    const { data, error } = await supabase
      .from("order_totals")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    if (error || !data) {
      console.error(
        "Nenhum registro encontrado para atualizar em order_totals.",
        error
      );
      return soma;
    }

    // Atualizar o registro encontrado
    const result = await updateOrderTotal(data.id, {
      user_id: user.id,
      total_product_price: soma,
      total_final_price: soma // ajuste se necessário
    });
    console.log("Resultado do updateOrderTotal:", result);

    return soma;
  }
}
