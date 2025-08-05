import { supabase } from '../../../../lib/supabase';

export interface AdminVerificationResult {
  isAdmin: boolean;
  userId: string | null;
}

/**
 * Verifica se o usuário é admin usando a MESMA estratégia do Dashboard
 * Consulta a tabela 'admins' com eq("id", user.id) e verifica se role === "admin"
 */
export async function verifyAdminStatus(): Promise<AdminVerificationResult> {
  try {
    // 1. Buscar usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("AdminVerification: Nenhum usuário autenticado");
      return {
        isAdmin: false,
        userId: null,
      };
    }

    console.log("AdminVerification: Verificando admin para usuário:", user.id);

    // 2. Usar a MESMA estratégia do Dashboard - verificar na tabela admins
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    console.log("AdminVerification: Resultado da consulta admin:", {
      adminData,
      adminError,
    });

    const isAdmin = adminData?.role === "admin";
    
    if (isAdmin) {
      console.log("AdminVerification: Usuário é admin!");
    } else {
      console.log("AdminVerification: Usuário não é admin");
    }

    return {
      isAdmin,
      userId: user.id,
    };

  } catch (error) {
    console.error('AdminVerification: Erro ao verificar status de admin:', error);
    return {
      isAdmin: false,
      userId: null,
    };
  }
}
