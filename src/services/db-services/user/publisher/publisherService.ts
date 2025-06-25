import { supabase } from "../../../../lib/supabase";

// Services para publishers

export interface PublisherService {
  id: string;
  current_id: string;
  service_title: string;
  service_type: string;
  product_type: string; // uuid do form relacionado
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export async function getPublisherServices(): Promise<
  PublisherService[] | null
> {
  const { data, error } = await supabase.from("publisher_services").select("*");

  if (error) {
    console.error("Erro ao buscar publisher_services:", error);
    return null;
  }
  return data as PublisherService[];
}

export async function getPublisherServiceById(
  id: string
): Promise<PublisherService | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Erro ao buscar publisher_service por id:", error);
    return null;
  }
  return data as PublisherService;
}

export async function createPublisherService(
  service: Omit<PublisherService, "id" | "created_at" | "updated_at">
): Promise<PublisherService | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .insert([service])
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar publisher_service:", error);
    return null;
  }
  return data as PublisherService;
}

export async function updatePublisherService(
  id: string,
  updates: Partial<PublisherService>
): Promise<PublisherService | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("Erro ao atualizar publisher_service:", error);
    return null;
  }
  return data as PublisherService;
}

export async function deletePublisherService(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("publisher_services")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Erro ao deletar publisher_service:", error);
    return false;
  }
  return true;
}

// Desativa todos os outros do mesmo service_type e publisher_id antes de ativar o novo
export async function setActivePublisherService(
  id: string,
  current_id: string,
  service_type: string,
  checked: boolean
) {
  console.log("setActivePublisherService params:", {
    id,
    current_id,
    service_type,
    checked
  });

  // Só desativa todos se checked for true
  if (checked) {
    // 1. Busca outros registros com o mesmo current_id e service_type igual ao recebido, mas id diferente
    const { data: otherServices, error } = await supabase
      .from("publisher_services")
      .select("id, is_active")
      .eq("current_id", current_id)
      .eq("service_type", service_type)
      .neq("id", id);

    if (error) {
      console.error("Erro ao buscar outros serviços:", error);
      return;
    }

    // 2 e 3. Se existir, desativa todos esses registros (is_active: false)
    if (otherServices && otherServices.length > 0) {
      const otherIds = otherServices.map((s: { id: string }) => s.id);
      await supabase
        .from("publisher_services")
        .update({ is_active: false })
        .in("id", otherIds);
    }
  }

  // 4. Atualiza o registro alvo (id recebido) com o valor de checked
  await supabase
    .from("publisher_services")
    .update({ is_active: checked })
    .eq("id", id);
}

export async function getPublisherServicesByCurrentId(
  current_id: string
): Promise<PublisherService[] | null> {
  const { data, error } = await supabase
    .from("publisher_services")
    .select("*")
    .eq("current_id", current_id);

  if (error) {
    console.error("Erro ao buscar publisher_services por current_id:", error);
    return null;
  }
  return data as PublisherService[];
}
