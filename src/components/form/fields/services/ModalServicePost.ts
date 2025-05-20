import { supabase } from "../../../../lib/supabase";

export interface ModalServiceData {
  publisherId: string; // novo campo obrigatório
  serviceTitle: string;
  price: string; // deve ser convertido para número
  promoPrice?: string; // deve ser convertido para número ou null
  label: string;
  features: string[];
}

export async function postModalService(data: ModalServiceData) {
  try {
    const { publisherId, serviceTitle, price, promoPrice, label, features } =
      data;
    const insertData = {
      publisher_id: publisherId,
      service_title: serviceTitle,
      price: Number(price.replace(/[^\d,.-]/g, "").replace(",", ".")),
      promo_price: promoPrice
        ? Number(promoPrice.replace(/[^\d,.-]/g, "").replace(",", "."))
        : null,
      label: label || "Publicação comercial",
      features: features,
      is_active: true,
      updated_at: new Date().toISOString()
    };
    const { data: result, error } = await supabase
      .from("publisher_services")
      .insert([insertData]);
    if (error) throw error;
    console.log("Serviço salvo com sucesso:", result);
    return result;
  } catch (err) {
    console.error("Erro ao salvar serviço no banco:", err);
    throw err;
  }
}
