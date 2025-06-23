import {
  FeedbackFormData,
  FeedbackSubmission,
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES
} from "../types/feedback";
import { FeedbackSubmissionsService } from "../../../../context/db-context/services/feedbackSubmissionsService";

// Funções auxiliares para conversão
export function getCategoryName(categoryId: number): string {
  const category = FEEDBACK_CATEGORIES.find(
    (cat) => cat.category_id === categoryId
  );
  return category?.category || "Categoria não encontrada";
}

export function getPriorityName(priorityId: number): string {
  const priority = FEEDBACK_PRIORITIES.find(
    (pri) => pri.priority_id === priorityId
  );
  return priority?.priority || "Prioridade não encontrada";
}

export function getCategoryId(categoryName: string): number {
  const category = FEEDBACK_CATEGORIES.find(
    (cat) => cat.category === categoryName
  );
  return category?.category_id || 0;
}

export function getPriorityId(priorityName: string): number {
  const priority = FEEDBACK_PRIORITIES.find(
    (pri) => pri.priority === priorityName
  );
  return priority?.priority_id || 0;
}

// Função atualizada para usar o serviço do Supabase
export async function submitFeedback(
  formData: FeedbackFormData
): Promise<FeedbackSubmission> {
  // Validação dos dados
  if (!formData.name.trim()) {
    throw new Error("Nome é obrigatório");
  }

  if (!formData.email.trim() || !isValidEmail(formData.email)) {
    throw new Error("Email válido é obrigatório");
  }

  if (!formData.category || formData.category === 0) {
    throw new Error("Categoria é obrigatória");
  }

  if (!formData.subject.trim()) {
    throw new Error("Assunto é obrigatório");
  }

  if (!formData.message.trim()) {
    throw new Error("Mensagem é obrigatória");
  }

  if (!formData.priority || formData.priority === 0) {
    throw new Error("Prioridade é obrigatória");
  }
  try {
    // Converter IDs para nomes usando as funções auxiliares
    const categoryName = getCategoryName(formData.category);
    const priorityName = getPriorityName(formData.priority);

    // Criar os dados para o serviço
    const submissionData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      category: categoryName,
      priority: priorityName,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      user_type: "user",
      is_internal: false
    };

    // Usar o serviço para criar o feedback
    const result = await FeedbackSubmissionsService.create(submissionData); // Converter o resultado para o formato esperado pelo componente
    const submission: FeedbackSubmission = {
      id: result.id,
      name: result.name,
      email: result.email,
      category: getCategoryId(result.category), // result.category agora é string
      priority: getPriorityId(result.priority), // result.priority agora é string
      subject: result.subject,
      message: result.message,
      submittedAt: new Date(result.created_at),
      status: result.status as
        | "pending"
        | "reviewed"
        | "implemented"
        | "rejected"
    };

    return submission;
  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    throw error;
  }
}

// Função para buscar todas as submissões de feedback do usuário atual
export async function getFeedbackSubmissions(): Promise<FeedbackSubmission[]> {
  try {
    const result = await FeedbackSubmissionsService.listUserFeedbacks();

    // Converter o resultado para o formato esperado pelo componente
    return result.data.map((feedback) => ({
      id: feedback.id,
      name: feedback.name,
      email: feedback.email,
      category: getCategoryId(feedback.category), // feedback.category agora é string
      priority: getPriorityId(feedback.priority), // feedback.priority agora é string
      subject: feedback.subject,
      message: feedback.message,
      submittedAt: new Date(feedback.created_at),
      status: feedback.status as
        | "pending"
        | "reviewed"
        | "implemented"
        | "rejected"
    }));
  } catch (error) {
    console.error("Erro ao buscar feedbacks:", error);
    return [];
  }
}

// Função para atualizar o status de um feedback
export async function updateFeedbackStatus(
  id: string,
  status: FeedbackSubmission["status"]
): Promise<void> {
  try {
    await FeedbackSubmissionsService.updateStatus(id, status);
  } catch (error) {
    console.error("Erro ao atualizar status do feedback:", error);
    throw new Error("Erro ao atualizar status do feedback");
  }
}

// Função para deletar um feedback
export async function deleteFeedback(id: string): Promise<void> {
  try {
    await FeedbackSubmissionsService.delete(id);
  } catch (error) {
    console.error("Erro ao deletar feedback:", error);
    throw new Error("Erro ao deletar feedback");
  }
}

// Funções auxiliares
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para obter estatísticas de feedback
export async function getFeedbackStats(): Promise<{
  total: number;
  pending: number;
  reviewed: number;
  implemented: number;
  rejected: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}> {
  try {
    const stats = await FeedbackSubmissionsService.getStats();

    return {
      total: stats.total,
      pending: stats.pending,
      reviewed: stats.reviewed,
      implemented: 0, // Pode ser mapeado se você tiver esse status
      rejected: 0, // Pode ser mapeado se você tiver esse status
      byCategory: stats.by_category,
      byPriority: stats.by_priority
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      implemented: 0,
      rejected: 0,
      byCategory: {},
      byPriority: {}
    };
  }
}

// Função para buscar feedback por filtros
export async function getFeedbackByFilter(filters: {
  status?: FeedbackSubmission["status"];
  category?: number;
  priority?: number;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<FeedbackSubmission[]> {
  try {
    const serviceFilters = {
      status: filters.status,
      category: filters.category
        ? getCategoryName(filters.category)
        : undefined,
      priority: filters.priority
        ? getPriorityName(filters.priority)
        : undefined,
      date_from: filters.dateFrom?.toISOString(),
      date_to: filters.dateTo?.toISOString()
    };

    const result = await FeedbackSubmissionsService.list(serviceFilters); // Converter o resultado para o formato esperado pelo componente
    return result.data.map((feedback) => ({
      id: feedback.id,
      name: feedback.name,
      email: feedback.email,
      category: getCategoryId(feedback.category), // feedback.category agora é string
      priority: getPriorityId(feedback.priority), // feedback.priority agora é string
      subject: feedback.subject,
      message: feedback.message,
      submittedAt: new Date(feedback.created_at),
      status: feedback.status as
        | "pending"
        | "reviewed"
        | "implemented"
        | "rejected"
    }));
  } catch (error) {
    console.error("Erro ao buscar feedbacks filtrados:", error);
    return [];
  }
}
