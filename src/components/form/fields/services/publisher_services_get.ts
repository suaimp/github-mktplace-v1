import { supabase } from "../../../../lib/supabase";

// Busca todos os serviços da tabela publisher_services
export async function getPublisherServices() {
  console.log("entrando na função getPublisherServices");
  try {
    console.log("entrando na try getPublisherServices");
    const { data, error } = await supabase
      .from("publisher_services")
      .select("*");

    if (error) throw error;
    console.log("publisher_services data:", data);
    return data;
  } catch (err) {
    console.log("Erro ao buscar publisher_services:", err);
    return null;
  }
}
