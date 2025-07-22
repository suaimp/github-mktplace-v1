export interface FeedbackFormData {
  name: string;
  email: string;
  category: number;
  subject: string;
  message: string;
  phone: string;
}

export interface FeedbackSubmission extends FeedbackFormData {
  id: string;
  submittedAt: Date;
  status: "pending" | "reviewed" | "implemented" | "rejected";
}

export type FeedbackStatus = FeedbackSubmission["status"];

export interface CategoryOption {
  category: string;
  category_id: number;
}

export const FEEDBACK_CATEGORIES: CategoryOption[] = [
  { category: "Melhoria do Produto", category_id: 1 },
  { category: "Experiência do Usuário", category_id: 2 },
  { category: "Performance", category_id: 3 },
  { category: "Nova Funcionalidade", category_id: 4 },
  { category: "Relatório de Bug", category_id: 5 },
  { category: "Atendimento ao Cliente", category_id: 6 },
  { category: "Outros", category_id: 7 }
];

export const FEEDBACK_STATUSES = [
  "pending",
  "reviewed",
  "implemented",
  "rejected"
] as const;
