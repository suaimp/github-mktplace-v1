/**
 * Serviço para operações de pagamento no banco de dados
 * Responsabilidade: CRUD operations para tabelas relacionadas a pagamentos
 */

import { supabase } from "../../../../lib/supabase";

/**
 * Interface para dados de pagamento PIX
 */
export interface PixPaymentData {
  id?: string;
  user_id: string;
  order_id: string;
  payment_id?: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  qr_code?: string;
  qr_code_url?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Cria um registro de pagamento PIX
 */
export async function createPixPayment(
  paymentData: Omit<PixPaymentData, "id" | "created_at" | "updated_at">
): Promise<PixPaymentData | null> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar pagamento PIX:", error);
      return null;
    }

    return data as PixPaymentData;
  } catch (error) {
    console.error("Erro ao criar pagamento PIX:", error);
    return null;
  }
}

/**
 * Atualiza um pagamento PIX
 */
export async function updatePixPayment(
  paymentId: string,
  updates: Partial<PixPaymentData>
): Promise<PixPaymentData | null> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar pagamento PIX:", error);
      return null;
    }

    return data as PixPaymentData;
  } catch (error) {
    console.error("Erro ao atualizar pagamento PIX:", error);
    return null;
  }
}

/**
 * Busca pagamento PIX por order_id
 */
export async function getPixPaymentByOrderId(
  orderId: string
): Promise<PixPaymentData | null> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .eq("payment_method", "pix")
      .single();

    if (error) {
      console.error("Erro ao buscar pagamento PIX:", error);
      return null;
    }

    return data as PixPaymentData;
  } catch (error) {
    console.error("Erro ao buscar pagamento PIX:", error);
    return null;
  }
}

/**
 * Busca pagamentos PIX por usuário
 */
export async function getPixPaymentsByUser(
  userId: string
): Promise<PixPaymentData[]> {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("payment_method", "pix")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pagamentos PIX do usuário:", error);
      return [];
    }

    return data as PixPaymentData[];
  } catch (error) {
    console.error("Erro ao buscar pagamentos PIX do usuário:", error);
    return [];
  }
}
