import {
  getCartCheckoutResumeByUser,
  updateCartCheckoutResume
} from "../../../../services/db-services/marketplace-services/checkout/CartCheckoutResumeService";

// Função de ação para setar serviço selecionado em todas as linhas do usuário
export async function setService(service: any) {
  // Extrai apenas os campos necessários
  const payload = {
    title: service.title,
    price: service.price, // Inclui o campo price
    price_per_word: service.price_per_word,
    word_count: service.word_count,
    is_free: service.is_free,
    benefits: service.benefits
  };
  console.log("Payload sendo enviado com benefits:", payload);
  const valueToSet = [payload];

  // Recupera o usuário logado via Supabase Auth
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Usuário não autenticado.");
    return;
  }
  const userId = user.id;

  // Busca todos os registros do usuário na tabela
  const items = await getCartCheckoutResumeByUser(userId);
  if (!items || items.length === 0) {
    console.error("Nenhum item encontrado para o usuário.");
    return;
  }

  // Atualiza todos os registros do usuário
  await Promise.all(
    items.map(async (item) => {
      // Verifica se há um valor personalizado de word_count no item atual
      let customWordCount: number | null = null;
      if (item.service_selected && Array.isArray(item.service_selected) && item.service_selected.length > 0) {
        const serviceData = item.service_selected[0];
        if (typeof serviceData === "object" && serviceData.word_count !== undefined) {
          // Verifica se o valor é diferente do padrão do serviço (indicando que foi personalizado)
          // Também verifica se o valor é maior que 0 para evitar valores inválidos
          if (serviceData.word_count !== service.word_count && serviceData.word_count > 0) {
            customWordCount = serviceData.word_count;
          }
        }
      }
      
      // Cria o payload preservando o valor personalizado se existir
      const itemPayload = {
        title: service.title,
        price: service.price,
        price_per_word: service.price_per_word,
        word_count: customWordCount !== null ? customWordCount : service.word_count,
        is_free: service.is_free,
        benefits: service.benefits
      };
      
      return updateCartCheckoutResume(item.id, { service_selected: [itemPayload] });
    })
  );
  console.log("Todos os registros atualizados com sucesso!", valueToSet);

  // Após atualizar todos os registros do usuário
  window.dispatchEvent(new Event("resume-table-reload"));
}
