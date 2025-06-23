import { supabase } from "../../../lib/supabase";

export interface CategoryObject {
  category: string;
  category_id: number;
}

export interface PriorityObject {
  priority: string;
  priority_id: number;
}

export interface FeedbackSubmission {
  id: string;
  user_id: string;
  name: string;
  email: string;
  category: CategoryObject[]; // Array de objetos no banco
  priority: PriorityObject[]; // Array de objetos no banco
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  user_type: string;
  is_internal: boolean;
}

// Interface para retorno ao frontend (com strings simples)
export interface FeedbackSubmissionDisplay {
  id: string;
  user_id: string;
  name: string;
  email: string;
  category: string; // String simples para o frontend
  priority: string; // String simples para o frontend
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  user_type: string;
  is_internal: boolean;
}

export interface CreateFeedbackSubmissionInput {
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  user_type?: string;
  is_internal?: boolean;
}

export interface UpdateFeedbackSubmissionInput {
  name?: string;
  email?: string;
  category?: string;
  priority?: string;
  subject?: string;
  message?: string;
  status?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  user_type?: string;
  is_internal?: boolean;
}

export interface FeedbackFilters {
  status?: string;
  category?: string;
  priority?: string;
  user_type?: string;
  is_internal?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export class FeedbackSubmissionsService {
  // Funções utilitárias para conversão de dados
  private static extractCategoryName(categoryArray: CategoryObject[]): string {
    return Array.isArray(categoryArray) &&
      categoryArray.length > 0 &&
      categoryArray[0]?.category
      ? categoryArray[0].category
      : "Outros";
  }

  private static extractPriorityName(priorityArray: PriorityObject[]): string {
    return Array.isArray(priorityArray) &&
      priorityArray.length > 0 &&
      priorityArray[0]?.priority
      ? priorityArray[0].priority
      : "Média";
  }

  // Função auxiliar para verificar se o usuário é admin
  private static async isAdmin(userId?: string): Promise<boolean> {
    try {
      const userIdToCheck =
        userId || (await supabase.auth.getUser()).data.user?.id;

      if (!userIdToCheck) return false;

      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("id", userIdToCheck)
        .maybeSingle();

      return !!adminData;
    } catch (error) {
      console.error("Erro ao verificar se usuário é admin:", error);
      return false;
    }
  } // Converter resultado do banco para formato do frontend
  private static convertToDisplay(
    feedback: FeedbackSubmission
  ): FeedbackSubmissionDisplay {
    return {
      ...feedback,
      category: this.extractCategoryName(feedback.category),
      priority: this.extractPriorityName(feedback.priority)
    };
  }
  private static getCategoryId(categoryName: string): number {
    const categories = [
      { category: "Melhoria do Produto", category_id: 1 },
      { category: "Experiência do Usuário", category_id: 2 },
      { category: "Performance", category_id: 3 },
      { category: "Nova Funcionalidade", category_id: 4 },
      { category: "Relatório de Bug", category_id: 5 },
      { category: "Atendimento ao Cliente", category_id: 6 },
      { category: "Outros", category_id: 7 }
    ];

    const found = categories.find((cat) => cat.category === categoryName);
    return found?.category_id || 7; // Default para "Outros"
  }

  // Função auxiliar para obter ID da prioridade pelo nome
  private static getPriorityId(priorityName: string): number {
    const priorities = [
      { priority: "Baixa", priority_id: 1 },
      { priority: "Média", priority_id: 2 },
      { priority: "Alta", priority_id: 3 }
    ];

    const found = priorities.find((pri) => pri.priority === priorityName);
    return found?.priority_id || 2; // Default para "Média"
  }
  // Criar novo feedback
  static async create(
    data: CreateFeedbackSubmissionInput
  ): Promise<FeedbackSubmissionDisplay> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Criar arrays de objetos para category e priority
    const categoryId = this.getCategoryId(data.category);
    const priorityId = this.getPriorityId(data.priority);

    const categoryArray: CategoryObject[] = [
      { category: data.category, category_id: categoryId }
    ];

    const priorityArray: PriorityObject[] = [
      { priority: data.priority, priority_id: priorityId }
    ];
    const feedbackData = {
      user_id: user.id,
      name: data.name,
      email: data.email,
      category: categoryArray,
      priority: priorityArray,
      subject: data.subject,
      message: data.message,
      status: "pending",
      user_type: data.user_type || "user",
      is_internal: data.is_internal || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: feedback, error } = await supabase
      .from("feedback_submissions")
      .insert(feedbackData)
      .select()
      .single();
    if (error) {
      console.error("Erro ao criar feedback:", error);
      throw new Error(`Erro ao criar feedback: ${error.message}`);
    }

    // Converter para formato do frontend
    return this.convertToDisplay(feedback);
  }
  // Buscar feedback por ID
  // Admins podem ver qualquer feedback, usuários normais só os próprios
  static async getById(id: string): Promise<FeedbackSubmission | null> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    let query = supabase.from("feedback_submissions").select("*").eq("id", id);

    // Se não for admin, só pode ver seus próprios feedbacks
    if (!isUserAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data: feedback, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Não encontrado
      }
      console.error("Erro ao buscar feedback:", error);
      throw new Error(`Erro ao buscar feedback: ${error.message}`);
    }

    return feedback;
  } // Listar feedbacks com filtros e paginação
  // Admins podem ver todos os feedbacks, usuários normais só veem os próprios
  static async list(
    filters: FeedbackFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: FeedbackSubmissionDisplay[]; count: number }> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    let query = supabase
      .from("feedback_submissions")
      .select("*", { count: "exact" });

    // Se não for admin, filtrar apenas feedbacks do próprio usuário
    if (!isUserAdmin) {
      query = query.eq("user_id", user.id);
    }

    // Aplicar filtros
    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.category) {
      // Procurar por objetos que contenham a categoria especificada
      query = query.contains("category", [{ category: filters.category }]);
    }

    if (filters.priority) {
      // Procurar por objetos que contenham a prioridade especificada
      query = query.contains("priority", [{ priority: filters.priority }]);
    }

    if (filters.user_type) {
      query = query.eq("user_type", filters.user_type);
    }

    if (filters.is_internal !== undefined) {
      query = query.eq("is_internal", filters.is_internal);
    }

    if (filters.date_from) {
      query = query.gte("created_at", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("created_at", filters.date_to);
    }

    if (filters.search) {
      query = query.or(
        `subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%,name.ilike.%${filters.search}%`
      );
    }

    // Ordenação e paginação
    const offset = (page - 1) * limit;
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: feedbacks, error, count } = await query;
    if (error) {
      console.error("Erro ao listar feedbacks:", error);
      throw new Error(`Erro ao listar feedbacks: ${error.message}`);
    }

    return {
      data: (feedbacks || []).map((feedback) =>
        this.convertToDisplay(feedback)
      ),
      count: count || 0
    };
  }
  // Listar feedbacks do usuário atual
  static async listUserFeedbacks(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: FeedbackSubmissionDisplay[]; count: number }> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const offset = (page - 1) * limit;

    const {
      data: feedbacks,
      error,
      count
    } = await supabase
      .from("feedback_submissions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Erro ao listar feedbacks do usuário:", error);
      throw new Error(`Erro ao listar feedbacks: ${error.message}`);
    }

    return {
      data: (feedbacks || []).map((feedback) =>
        this.convertToDisplay(feedback)
      ),
      count: count || 0
    };
  }
  // Atualizar feedback
  // Admins podem atualizar qualquer feedback, usuários normais só os próprios
  static async update(
    id: string,
    data: UpdateFeedbackSubmissionInput
  ): Promise<FeedbackSubmission> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    let query = supabase
      .from("feedback_submissions")
      .update(updateData)
      .eq("id", id);

    // Se não for admin, só pode atualizar seus próprios feedbacks
    if (!isUserAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data: feedback, error } = await query.select().single();

    if (error) {
      console.error("Erro ao atualizar feedback:", error);
      throw new Error(`Erro ao atualizar feedback: ${error.message}`);
    }

    return feedback;
  }

  // Marcar como revisado (para admins)
  static async markAsReviewed(
    id: string,
    adminNotes?: string
  ): Promise<FeedbackSubmission> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const updateData = {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString()
    };

    const { data: feedback, error } = await supabase
      .from("feedback_submissions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao marcar feedback como revisado:", error);
      throw new Error(
        `Erro ao marcar feedback como revisado: ${error.message}`
      );
    }

    return feedback;
  }

  // Atualizar status
  static async updateStatus(
    id: string,
    status: string
  ): Promise<FeedbackSubmission> {
    return this.update(id, { status });
  }
  // Deletar feedback
  // Admins podem deletar qualquer feedback, usuários normais só os próprios
  static async delete(id: string): Promise<void> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    let query = supabase.from("feedback_submissions").delete().eq("id", id);

    // Se não for admin, só pode deletar seus próprios feedbacks
    if (!isUserAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { error } = await query;

    if (error) {
      console.error("Erro ao deletar feedback:", error);
      throw new Error(`Erro ao deletar feedback: ${error.message}`);
    }
  }
  // Estatísticas de feedback
  // Admins veem estatísticas de todos os feedbacks, usuários normais só dos próprios
  static async getStats(): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    in_progress: number;
    resolved: number;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
  }> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    // Função auxiliar para adicionar filtro de usuário se necessário
    const addUserFilter = (query: any) => {
      return isUserAdmin ? query : query.eq("user_id", user.id);
    };

    // Total geral
    const { count: total } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("*", { count: "exact", head: true })
    );

    // Por status
    const { count: pending } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
    );

    const { count: reviewed } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "reviewed")
    );

    const { count: in_progress } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress")
    );

    const { count: resolved } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved")
    ); // Por categoria
    const { data: categoryStats } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("category")
        .not("category", "is", null)
    );
    const by_category: Record<string, number> = {};
    categoryStats?.forEach((item) => {
      // Extrair categorias do array de objetos
      if (Array.isArray(item.category) && item.category.length > 0) {
        item.category.forEach((catObj: CategoryObject) => {
          if (catObj && catObj.category) {
            by_category[catObj.category] =
              (by_category[catObj.category] || 0) + 1;
          }
        });
      }
    });

    // Por prioridade
    const { data: priorityStats } = await addUserFilter(
      supabase
        .from("feedback_submissions")
        .select("priority")
        .not("priority", "is", null)
    );

    const by_priority: Record<string, number> = {};
    priorityStats?.forEach((item) => {
      // Extrair prioridades do array de objetos
      if (Array.isArray(item.priority) && item.priority.length > 0) {
        item.priority.forEach((priObj: PriorityObject) => {
          if (priObj && priObj.priority) {
            by_priority[priObj.priority] =
              (by_priority[priObj.priority] || 0) + 1;
          }
        });
      }
    });

    return {
      total: total || 0,
      pending: pending || 0,
      reviewed: reviewed || 0,
      in_progress: in_progress || 0,
      resolved: resolved || 0,
      by_category,
      by_priority
    };
  }

  // Buscar feedbacks por usuário específico (para admins)
  static async getFeedbacksByUser(
    userId: string
  ): Promise<FeedbackSubmission[]> {
    const { data: feedbacks, error } = await supabase
      .from("feedback_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar feedbacks do usuário:", error);
      throw new Error(`Erro ao buscar feedbacks do usuário: ${error.message}`);
    }

    return feedbacks || [];
  }
  // Buscar feedbacks recentes
  // Admins veem feedbacks recentes de todos os usuários, usuários normais só os próprios
  static async getRecentFeedbacks(
    limit: number = 5
  ): Promise<FeedbackSubmission[]> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    let query = supabase
      .from("feedback_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Se não for admin, só buscar feedbacks do próprio usuário
    if (!isUserAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data: feedbacks, error } = await query;

    if (error) {
      console.error("Erro ao buscar feedbacks recentes:", error);
      throw new Error(`Erro ao buscar feedbacks recentes: ${error.message}`);
    }

    return feedbacks || [];
  }

  // Métodos específicos para administradores

  // Listar todos os feedbacks (apenas para admins)
  static async getAllFeedbacks(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: FeedbackSubmission[]; count: number }> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    if (!isUserAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem visualizar todos os feedbacks"
      );
    }

    const offset = (page - 1) * limit;

    const {
      data: feedbacks,
      error,
      count
    } = await supabase
      .from("feedback_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Erro ao listar todos os feedbacks:", error);
      throw new Error(`Erro ao listar feedbacks: ${error.message}`);
    }

    return {
      data: feedbacks || [],
      count: count || 0
    };
  }

  // Buscar feedbacks por status específico (para admins)
  static async getFeedbacksByStatus(
    status: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: FeedbackSubmission[]; count: number }> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    if (!isUserAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem usar este método"
      );
    }

    const offset = (page - 1) * limit;

    const {
      data: feedbacks,
      error,
      count
    } = await supabase
      .from("feedback_submissions")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Erro ao buscar feedbacks por status:", error);
      throw new Error(`Erro ao buscar feedbacks: ${error.message}`);
    }

    return {
      data: feedbacks || [],
      count: count || 0
    };
  }

  // Buscar feedbacks pendentes (para admins)
  static async getPendingFeedbacks(): Promise<FeedbackSubmission[]> {
    const result = await this.getFeedbacksByStatus("pending");
    return result.data;
  }

  // Marcar múltiplos feedbacks como revisados (para admins)
  static async markMultipleFeedbacksAsReviewed(
    feedbackIds: string[],
    adminNotes?: string
  ): Promise<FeedbackSubmission[]> {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    const isUserAdmin = await this.isAdmin(user.id);

    if (!isUserAdmin) {
      throw new Error(
        "Acesso negado: apenas administradores podem usar este método"
      );
    }

    const updateData = {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString()
    };

    const { data: feedbacks, error } = await supabase
      .from("feedback_submissions")
      .update(updateData)
      .in("id", feedbackIds)
      .select();

    if (error) {
      console.error("Erro ao marcar feedbacks como revisados:", error);
      throw new Error(
        `Erro ao marcar feedbacks como revisados: ${error.message}`
      );
    }

    return feedbacks || [];
  }
}

export default FeedbackSubmissionsService;
