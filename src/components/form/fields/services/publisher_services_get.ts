import { supabase } from "../../../../lib/supabase";

// Busca todos os serviços da tabela publisher_services filtrando por publisher_id do usuário logado
export async function getPublisherServices() {
  console.log("entrando na função getPublisherServices");
  try {
    console.log("entrando na try getPublisherServices");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    const { data, error } = await supabase
      .from("publisher_services")
      .select("*")
      .eq("publisher_id", user.id);

    if (error) throw error;
    console.log("publisher_services data:", data);
    return data;
  } catch (err) {
    console.log("Erro ao buscar publisher_services:", err);
    return null;
  }
}
