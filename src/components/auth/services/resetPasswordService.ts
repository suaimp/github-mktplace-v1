import { supabase } from "../../../lib/supabase";
import { normalizeEmail } from "../utils/emailNormalization";

/**
 * Serviços relacionados ao reset de senha
 * Responsabilidade: Gerenciar operações de recuperação de senha
 */

export interface ResetPasswordResponse {
  success: boolean;
  error?: string;
}

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const normalizedEmail = normalizeEmail(email);

  // Verificar se email existe em platform_users
  const { data: userData } = await supabase
    .from("platform_users")
    .select("id, email")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  // Verificar se email existe em admins
  const { data: adminData } = await supabase
    .from("admins")
    .select("id, email")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  return !!(userData || adminData);
};

export const sendPasswordResetEmail = async (email: string): Promise<ResetPasswordResponse> => {
  try {
    const normalizedEmail = normalizeEmail(email);

    // Verificar se o email existe antes de enviar
    const emailExists = await checkEmailExists(normalizedEmail);
    
    if (!emailExists) {
      throw new Error("Email não encontrado");
    }

    // Enviar email de reset
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return { 
      success: false, 
      error: error.message || "Erro ao enviar email de recuperação. Tente novamente." 
    };
  }
};
