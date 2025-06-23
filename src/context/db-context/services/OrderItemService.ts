import { supabase } from "../../../lib/supabase";

export interface OrderItem {
  id: string;
  order_id: string;
  entry_id?: string;
  product_name: string;
  product_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  niche?: any;
  service_content?: any;
  created_at?: string;
  article_document_path?: string;
  article_doc?: string;
  article_url_status?: string;
  publication_status?: string;
  article_url?: string;
}

function showToast(message: string, type: "success" | "error" = "success") {
  if (typeof window !== "undefined" && window.document) {
    // Remove qualquer toast anterior
    const oldToast = document.getElementById("orderitem-toast");
    if (oldToast) oldToast.remove();
    const toast = document.createElement("div");
    toast.id = "orderitem-toast";
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "32px";
    toast.style.right = "32px";
    toast.style.zIndex = "99999";
    toast.style.padding = "14px 28px";
    toast.style.borderRadius = "8px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.fontSize = "1rem";
    toast.style.background = type === "success" ? "#22c55e" : "#ef4444";
    toast.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
    toast.style.opacity = "0.98";
    toast.style.transition = "opacity 0.3s";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
}

export const OrderItemService = {
  async uploadArticleDocument(
    selectedItemId: string,
    filePath: string,
    fileName: string
  ) {
    const { error } = await supabase
      .from("order_items")
      .update({
        article_document_path: filePath,
        article_doc: fileName
      })
      .eq("id", selectedItemId);
    if (error) {
      showToast("Erro ao atualizar documento do artigo.", "error");
      throw error;
    }
    showToast("Documento do artigo atualizado com sucesso!", "success");
  },

  async getOrderItemWithOrder(selectedItemId: string) {
    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        id,
        order_id,
        entry_id,
        product_name,
        product_url,
        quantity,
        unit_price,
        total_price,
        niche,
        service_content,
        created_at,
        article_document_path,
        article_doc,
        article_url_status,
        publication_status,
        article_url,
        orders!inner(
          id,
          user_id
        )
      `
      )
      .eq("id", selectedItemId)
      .single();
    if (error) {
      showToast("Erro ao buscar item do pedido.", "error");
      throw error;
    }
    showToast("Item do pedido carregado com sucesso!", "success");
    return data;
  },

  async createOrderItem(item: Omit<OrderItem, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("order_items")
      .insert([item])
      .select()
      .single();
    if (error) {
      showToast("Erro ao criar item do pedido.", "error");
      throw error;
    }
    showToast("Item do pedido criado com sucesso!", "success");
    return data;
  },

  async getOrderItemById(id: string) {
    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        id,
        order_id,
        entry_id,
        product_name,
        product_url,
        quantity,
        unit_price,
        total_price,
        niche,
        service_content,
        created_at,
        article_document_path,
        article_doc,
        article_url_status,
        publication_status,
        article_url
      `
      )
      .eq("id", id)
      .single();
    if (error) {
      showToast("Erro ao buscar item do pedido.", "error");
      throw error;
    }
    showToast("Item do pedido carregado com sucesso!", "success");
    return data;
  },

  async updateOrderItem(id: string, updates: Partial<OrderItem>) {
    const { data, error } = await supabase
      .from("order_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      showToast("Erro ao atualizar item do pedido.", "error");
      throw error;
    }
    showToast("Item do pedido atualizado com sucesso!", "success");
    return data;
  },

  async deleteOrderItem(id: string) {
    const { error } = await supabase.from("order_items").delete().eq("id", id);
    if (error) {
      showToast("Erro ao deletar item do pedido.", "error");
      throw error;
    }
    showToast("Item do pedido deletado com sucesso!", "success");
    return true;
  },

  async listOrderItemsByOrder(order_id: string) {
    const { data, error } = await supabase
      .from("order_items")
      .select(
        `
        id,
        order_id,
        entry_id,
        product_name,
        product_url,
        quantity,
        unit_price,
        total_price,
        niche,
        service_content,
        created_at,
        article_document_path,
        article_doc,
        article_url_status,
        publication_status,
        article_url
      `
      )
      .eq("order_id", order_id);
    if (error) {
      showToast("Erro ao listar itens do pedido.", "error");
      throw error;
    }
    showToast("Itens do pedido carregados com sucesso!", "success");
    return data;
  }
};
