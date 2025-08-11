import { supabase } from "../../lib/supabase";
import { 
  OrderChatMessage, 
  CreateChatMessageInput, 
  ChatMessageFilters, 
  ChatStats,
  OrderChatMessageWithSender 
} from "./types";

/**
 * Serviço para operações CRUD na tabela order_chat
 */
export class OrderChatService {
  /**
   * Verifica se o usuário atual é admin
   */
  private static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data: adminData } = await supabase
        .from("admins")
        .select("role_id")
        .eq("id", user.user.id)
        .maybeSingle();

      if (!adminData || !adminData.role_id) return false;

      // Verificar se tem role admin
      const { data: roleData } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "admin")
        .eq("id", adminData.role_id)
        .maybeSingle();

      return !!roleData;
    } catch (error) {
      console.error("Erro ao verificar se usuário é admin:", error);
      return false;
    }
  }

  /**
   * Cria uma nova mensagem de chat
   */
  static async createMessage(input: CreateChatMessageInput): Promise<OrderChatMessage> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("Usuário não autenticado");
    }

    // Se é admin, verificar permissões
    if (input.sender_type === 'admin') {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        throw new Error("Usuário não tem permissão de admin");
      }
    }

    const { data, error } = await supabase
      .from("order_chat")
      .insert({
        order_id: input.order_id,
        order_item_id: input.order_item_id,
        entry_id: input.entry_id,
        sender_id: user.user.id,
        sender_type: input.sender_type,
        message: input.message,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar mensagem:", error);
      throw new Error("Falha ao enviar mensagem");
    }

    return data;
  }

  /**
   * Busca mensagens de chat com filtros
   */
  static async getMessages(filters: ChatMessageFilters): Promise<OrderChatMessage[]> {
    let query = supabase
      .from("order_chat")
      .select("*")
      .order("created_at", { ascending: true });

    // Aplicar filtros
    if (filters.order_id) {
      query = query.eq("order_id", filters.order_id);
    }
    
    if (filters.order_item_id) {
      query = query.eq("order_item_id", filters.order_item_id);
    }
    
    if (filters.entry_id) {
      query = query.eq("entry_id", filters.entry_id);
    }
    
    if (filters.sender_type) {
      query = query.eq("sender_type", filters.sender_type);
    }
    
    if (filters.is_read !== undefined) {
      query = query.eq("is_read", filters.is_read);
    }

    // Aplicar paginação
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar mensagens:", error);
      throw new Error("Falha ao carregar mensagens");
    }

    return data || [];
  }

  /**
   * Busca mensagens com informações do remetente
   */
  static async getMessagesWithSender(filters: ChatMessageFilters): Promise<OrderChatMessageWithSender[]> {
    // Primeiro, buscar as mensagens
    const messages = await this.getMessages(filters);
    
    if (messages.length === 0) {
      return [];
    }

    // Depois, buscar informações dos remetentes únicos
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
    
    const { data: senders, error: sendersError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", senderIds);

    if (sendersError) {
      console.error("Erro ao buscar remetentes:", sendersError);
      // Retornar mensagens sem dados do remetente
      return messages.map(msg => ({ ...msg, sender: undefined }));
    }

    // Combinar dados
    return messages.map(msg => {
      const sender = senders?.find(s => s.id === msg.sender_id);
      return {
        ...msg,
        sender: sender ? {
          id: sender.id,
          email: sender.email,
          full_name: sender.full_name
        } : undefined
      };
    });
  }

  /**
   * Marca mensagens como lidas
   */
  static async markAsRead(messageIds: string[]): Promise<void> {
    const { error } = await supabase
      .from("order_chat")
      .update({ is_read: true })
      .in("id", messageIds);

    if (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
      throw new Error("Falha ao marcar mensagens como lidas");
    }
  }

  /**
   * Marca todas as mensagens de um item como lidas
   */
  static async markItemMessagesAsRead(orderItemId: string): Promise<void> {
    const { error } = await supabase
      .from("order_chat")
      .update({ is_read: true })
      .eq("order_item_id", orderItemId);

    if (error) {
      console.error("Erro ao marcar mensagens do item como lidas:", error);
      throw new Error("Falha ao marcar mensagens como lidas");
    }
  }

  /**
   * Obtém estatísticas do chat para um item
   */
  static async getChatStats(orderItemId: string): Promise<ChatStats> {
    const { data, error } = await supabase
      .from("order_chat")
      .select("id, is_read, created_at")
      .eq("order_item_id", orderItemId);

    if (error) {
      console.error("Erro ao buscar estatísticas do chat:", error);
      throw new Error("Falha ao carregar estatísticas");
    }

    const messages = data || [];
    const unreadMessages = messages.filter(msg => !msg.is_read);
    const lastMessage = messages.length > 0 ? 
      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : 
      null;

    return {
      total_messages: messages.length,
      unread_messages: unreadMessages.length,
      last_message_at: lastMessage?.created_at
    };
  }

  /**
   * Deleta uma mensagem (apenas para admins)
   */
  static async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from("order_chat")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Erro ao deletar mensagem:", error);
      throw new Error("Falha ao deletar mensagem");
    }
  }

  /**
   * Cria um listener para novas mensagens em tempo real
   */
  static subscribeToMessages(
    orderItemId: string, 
    callback: (message: OrderChatMessage) => void
  ) {
    return supabase
      .channel(`order_chat_${orderItemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_chat',
          filter: `order_item_id=eq.${orderItemId}`,
        },
        (payload) => {
          callback(payload.new as OrderChatMessage);
        }
      )
      .subscribe();
  }

  /**
   * Remove listener de tempo real
   */
  static unsubscribeFromMessages(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
}
