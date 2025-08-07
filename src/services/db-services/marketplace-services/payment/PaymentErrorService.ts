/**
 * Extensão do PaymentService para logging de erros do PagarMe
 * Responsabilidade: Registrar erros de pagamento no banco de dados para análise
 */

import { supabase } from "../../../../lib/supabase";

/**
 * Interface para erro processado (local)
 */
interface ProcessedError {
  type: 'validation' | 'card' | 'system' | 'unknown';
  message: string;
  originalMessage?: string;
  actionRequired?: 'check_card_data' | 'try_different_card' | 'try_again_later' | 'contact_support';
}

/**
 * Interface para logs de erro de pagamento
 */
export interface PaymentErrorLog {
  id?: string;
  user_id?: string;
  order_id?: string;
  error_type: 'validation' | 'card' | 'system' | 'unknown';
  error_message: string;
  original_error?: string;
  action_required?: string;
  payment_method: 'credit_card' | 'pix' | 'boleto';
  component: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_agent?: string;
  created_at?: string;
}

/**
 * Registra erro de pagamento no banco de dados
 */
export async function logPaymentError(
  errorData: Omit<PaymentErrorLog, "id" | "created_at">
): Promise<PaymentErrorLog | null> {
  try {
    const { data, error } = await supabase
      .from("payment_error_logs")
      .insert([errorData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao registrar log de erro de pagamento:", error);
      return null;
    }

    return data as PaymentErrorLog;
  } catch (error) {
    console.error("Erro ao registrar log de erro de pagamento:", error);
    return null;
  }
}

/**
 * Registra erro processado do PagarMe
 */
export async function logPagarmeError(
  processedError: ProcessedError,
  context: {
    userId?: string;
    orderId?: string;
    paymentMethod: 'credit_card' | 'pix' | 'boleto';
    component: string;
    action: string;
    userAgent?: string;
  }
): Promise<PaymentErrorLog | null> {
  const severity = determineSeverity(processedError.type);
  
  const errorLog: Omit<PaymentErrorLog, "id" | "created_at"> = {
    user_id: context.userId,
    order_id: context.orderId,
    error_type: processedError.type,
    error_message: processedError.message,
    original_error: processedError.originalMessage,
    action_required: processedError.actionRequired,
    payment_method: context.paymentMethod,
    component: context.component,
    action: context.action,
    severity,
    user_agent: context.userAgent
  };

  return logPaymentError(errorLog);
}

/**
 * Busca estatísticas de erros por período
 */
export async function getPaymentErrorStats(
  startDate: string,
  endDate: string
): Promise<{
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByPaymentMethod: Record<string, number>;
  topErrors: Array<{
    error_message: string;
    count: number;
  }>;
}> {
  try {
    // Total de erros
    const { count: totalErrors } = await supabase
      .from("payment_error_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Erros por tipo
    const { data: errorsByTypeData } = await supabase
      .from("payment_error_logs")
      .select("error_type")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Erros por severidade
    const { data: errorsBySeverityData } = await supabase
      .from("payment_error_logs")
      .select("severity")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Erros por método de pagamento
    const { data: errorsByMethodData } = await supabase
      .from("payment_error_logs")
      .select("payment_method")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Top erros mais frequentes
    const { data: topErrorsData } = await supabase
      .from("payment_error_logs")
      .select("error_message")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    // Processar dados
    const errorsByType = countOccurrences(errorsByTypeData || [], 'error_type');
    const errorsBySeverity = countOccurrences(errorsBySeverityData || [], 'severity');
    const errorsByPaymentMethod = countOccurrences(errorsByMethodData || [], 'payment_method');
    const topErrors = getTopErrors(topErrorsData || []);

    return {
      totalErrors: totalErrors || 0,
      errorsByType,
      errorsBySeverity,
      errorsByPaymentMethod,
      topErrors
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas de erros:", error);
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByPaymentMethod: {},
      topErrors: []
    };
  }
}

/**
 * Busca erros recentes para debugging
 */
export async function getRecentPaymentErrors(
  limit: number = 50
): Promise<PaymentErrorLog[]> {
  try {
    const { data, error } = await supabase
      .from("payment_error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Erro ao buscar erros recentes:", error);
      return [];
    }

    return data as PaymentErrorLog[];
  } catch (error) {
    console.error("Erro ao buscar erros recentes:", error);
    return [];
  }
}

/**
 * Determina severidade baseada no tipo de erro
 */
function determineSeverity(errorType: ProcessedError['type']): PaymentErrorLog['severity'] {
  switch (errorType) {
    case 'validation':
      return 'low';
    case 'card':
      return 'medium';
    case 'system':
      return 'high';
    case 'unknown':
      return 'critical';
    default:
      return 'medium';
  }
}

/**
 * Conta ocorrências de um campo
 */
function countOccurrences(data: any[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  
  data?.forEach(item => {
    const value = item[field];
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}

/**
 * Obtém os erros mais frequentes
 */
function getTopErrors(data: any[]): Array<{ error_message: string; count: number }> {
  const errorCounts: Record<string, number> = {};
  
  data?.forEach(item => {
    const message = item.error_message;
    errorCounts[message] = (errorCounts[message] || 0) + 1;
  });

  return Object.entries(errorCounts)
    .map(([error_message, count]) => ({ error_message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
