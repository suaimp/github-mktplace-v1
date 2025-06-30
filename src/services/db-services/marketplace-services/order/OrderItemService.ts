import { supabase } from "../../../../lib/supabase";

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
    toast.innerHTML = `
      <div class="flex items-center justify-between gap-3 w-full sm:max-w-[340px] rounded-md border-b-4 p-3 shadow-theme-sm dark:bg-[#1E2634] ${type === "success" ? 'border-success-500' : 'border-error-500'}">
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg ${type === "success" ? 'bg-success-50 text-success-500' : 'bg-error-50 text-error-500'}">
            ${type === "success" ? `
              <svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" fill="none">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.70186 11.0001C2.70186 6.41711 6.41711 2.70186 11.0001 2.70186C15.5831 2.70186 19.2984 6.41711 19.2984 11.0001C19.2984 15.5831 15.5831 19.2984 11.0001 19.2984C6.41711 19.2984 2.70186 15.5831 2.70186 11.0001ZM11.0001 0.901855C5.423 0.901855 0.901855 5.423 0.901855 11.0001C0.901855 16.5772 5.423 21.0984 11.0001 21.0984C16.5772 21.0984 21.0984 16.5772 21.0984 11.0001C21.0984 5.423 16.5772 0.901855 11.0001 0.901855ZM14.6197 9.73951C14.9712 9.38804 14.9712 8.81819 14.6197 8.46672C14.2683 8.11525 13.6984 8.11525 13.347 8.46672L10.1894 11.6243L8.6533 10.0883C8.30183 9.7368 7.73198 9.7368 7.38051 10.0883C7.02904 10.4397 7.02904 11.0096 7.38051 11.3611L9.55295 13.5335C9.72174 13.7023 9.95065 13.7971 10.1894 13.7971C10.428 13.7971 10.657 13.7023 10.8257 13.5335L14.6197 9.73951Z" fill="#12B76A"></path>
              </svg>
            ` : `
              <svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="10" fill="#FEF3F2" stroke="#F04438" stroke-width="1.5"/>
                <path d="M7.75 7.75L14.25 14.25M14.25 7.75L7.75 14.25" stroke="#F04438" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            `}
          </div>
          <div>
            <h4 class="text-sm text-gray-800 sm:text-base dark:text-white/90">${type === "success" ? "Sucesso!" : "Erro!"}</h4>
            <div class="text-xs text-gray-700 dark:text-gray-200 mt-1">${message}</div>
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-800 dark:hover:text-white/90" id="orderitem-toast-close-btn">
          <svg class="size-6" width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    `;
    toast.style.position = "fixed";
    toast.style.top = "80px";
    toast.style.right = "32px";
 
    toast.style.zIndex = "99999";
    toast.style.maxWidth = "340px";
    toast.style.width = "100%";
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.3s";
    toast.style.pointerEvents = "auto";
    toast.style.backgroundColor = "#fff";
    document.body.appendChild(toast);
    // Fechar ao clicar no botão
    const closeBtn = toast.querySelector("#orderitem-toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
      });
    }
    // Fechar automaticamente após 2.5s
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
