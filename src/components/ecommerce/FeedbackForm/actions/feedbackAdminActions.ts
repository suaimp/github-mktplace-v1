import { FeedbackSubmissionsService } from "../../../../context/db-context/services/feedbackSubmissionsService";
import type { FeedbackSubmission as DBFeedbackSubmission } from "../../../../context/db-context/services/feedbackSubmissionsService";
import type { FeedbackSubmission } from "../types/feedback";
import { getCategoryId, getPriorityId } from "./feedbackActions";

// Funções específicas para administração de feedback

// Converter do formato do banco para o formato do componente
function convertToComponentFormat(
  dbFeedback: DBFeedbackSubmission
): FeedbackSubmission {
  return {
    id: dbFeedback.id,
    name: dbFeedback.name,
    email: dbFeedback.email,
    category: getCategoryId(dbFeedback.category),
    priority: getPriorityId(dbFeedback.priority),
    subject: dbFeedback.subject,
    message: dbFeedback.message,
    submittedAt: new Date(dbFeedback.created_at),
    status: dbFeedback.status as
      | "pending"
      | "reviewed"
      | "implemented"
      | "rejected"
  };
}

// Listar todos os feedbacks (para administradores)
export async function getAllFeedbacks(
  page: number = 1,
  limit: number = 10
): Promise<{ data: FeedbackSubmission[]; count: number }> {
  try {
    const result = await FeedbackSubmissionsService.list({}, page, limit);

    return {
      data: result.data.map(convertToComponentFormat),
      count: result.count
    };
  } catch (error) {
    console.error("Erro ao buscar todos os feedbacks:", error);
    return { data: [], count: 0 };
  }
}

// Marcar feedback como revisado
export async function markFeedbackAsReviewed(
  id: string,
  adminNotes?: string
): Promise<FeedbackSubmission> {
  try {
    const result = await FeedbackSubmissionsService.markAsReviewed(
      id,
      adminNotes
    );
    return convertToComponentFormat(result);
  } catch (error) {
    console.error("Erro ao marcar feedback como revisado:", error);
    throw error;
  }
}

// Atualizar status do feedback
export async function updateFeedbackStatus(
  id: string,
  status: string
): Promise<FeedbackSubmission> {
  try {
    const result = await FeedbackSubmissionsService.updateStatus(id, status);
    return convertToComponentFormat(result);
  } catch (error) {
    console.error("Erro ao atualizar status do feedback:", error);
    throw error;
  }
}

// Deletar feedback
export async function deleteFeedback(id: string): Promise<void> {
  try {
    await FeedbackSubmissionsService.delete(id);
  } catch (error) {
    console.error("Erro ao deletar feedback:", error);
    throw error;
  }
}

// Buscar feedback por ID
export async function getFeedbackById(
  id: string
): Promise<FeedbackSubmission | null> {
  try {
    const result = await FeedbackSubmissionsService.getById(id);
    return result ? convertToComponentFormat(result) : null;
  } catch (error) {
    console.error("Erro ao buscar feedback por ID:", error);
    return null;
  }
}

// Buscar feedbacks recentes
export async function getRecentFeedbacks(
  limit: number = 5
): Promise<FeedbackSubmission[]> {
  try {
    const result = await FeedbackSubmissionsService.getRecentFeedbacks(limit);
    return result.map(convertToComponentFormat);
  } catch (error) {
    console.error("Erro ao buscar feedbacks recentes:", error);
    return [];
  }
}

// Buscar feedbacks por usuário específico
export async function getFeedbacksByUser(
  userId: string
): Promise<FeedbackSubmission[]> {
  try {
    const result = await FeedbackSubmissionsService.getFeedbacksByUser(userId);
    return result.map(convertToComponentFormat);
  } catch (error) {
    console.error("Erro ao buscar feedbacks do usuário:", error);
    return [];
  }
}

// Estatísticas detalhadas
export async function getDetailedFeedbackStats() {
  try {
    return await FeedbackSubmissionsService.getStats();
  } catch (error) {
    console.error("Erro ao buscar estatísticas detalhadas:", error);
    return {
      total: 0,
      pending: 0,
      reviewed: 0,
      in_progress: 0,
      resolved: 0,
      by_category: {},
      by_priority: {}
    };
  }
}

// Buscar feedbacks com filtros avançados
export async function searchFeedbacks(
  filters: {
    status?: string;
    category?: string;
    priority?: string;
    user_type?: string;
    is_internal?: boolean;
    date_from?: string;
    date_to?: string;
    search?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<{ data: FeedbackSubmission[]; count: number }> {
  try {
    const result = await FeedbackSubmissionsService.list(filters, page, limit);

    return {
      data: result.data.map(convertToComponentFormat),
      count: result.count
    };
  } catch (error) {
    console.error("Erro ao buscar feedbacks com filtros:", error);
    return { data: [], count: 0 };
  }
}

export default {
  getAllFeedbacks,
  markFeedbackAsReviewed,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackById,
  getRecentFeedbacks,
  getFeedbacksByUser,
  getDetailedFeedbackStats,
  searchFeedbacks
};
