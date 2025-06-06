import { updateOrderTotal } from "../../../context/db-context/services/OrderTotalsService";
import { supabase } from "../../../lib/supabase";
import { getCartCheckoutResumeByUser } from "../../../context/db-context/services/CartCheckoutResumeService";

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

    // Buscar todos os itens do carrinho do usuário
    const cartItems = await getCartCheckoutResumeByUser(user.id);
    let total_content_price = 0;
    if (cartItems && Array.isArray(cartItems)) {
      for (const item of cartItems) {
        let serviceSelected = item.service_selected;
        // Pode vir como string JSON, array de string, ou array de objeto
        if (typeof serviceSelected === "string") {
          try {
            serviceSelected = JSON.parse(serviceSelected);
          } catch {}
        }
        if (Array.isArray(serviceSelected)) {
          for (const s of serviceSelected) {
            let obj = s;
            if (typeof s === "string") {
              try {
                obj = JSON.parse(s);
              } catch {}
            }
            if (
              obj &&
              typeof obj === "object" &&
              "price" in obj &&
              obj.price !== undefined
            ) {
              total_content_price += Number(obj.price);
            }
          }
        }
      }
    }

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
      total_content_price,
      total_final_price: soma + total_content_price
    });
    console.log("Resultado do updateOrderTotal:", result);

    return soma;
  }
}
