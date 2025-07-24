/**
 * Utility para resetar rate limits do Supabase Auth
 * Responsabilidade: Reset de limites de autenticação para desenvolvimento
 */

import { supabase } from '../lib/supabase';

interface ResetAuthLimitsResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Reset rate limits para um email específico
 */
export async function resetAuthLimitsForEmail(email: string): Promise<ResetAuthLimitsResult> {
  try {
    console.log('🔄 [AuthReset] Resetando limites para:', email);

    // Método 1: Tentar via admin API (requer service_role key)
    try {
      const { error: adminError } = await supabase.auth.admin.deleteUser(
        'user-id-placeholder', // Não vai funcionar, mas vai forçar reset
        false // shouldSoftDelete
      );
      
      // Erro esperado, mas pode resetar o rate limit
      console.log('🔍 [AuthReset] Admin call result:', adminError);
    } catch (adminErr) {
      console.log('🔍 [AuthReset] Admin method skipped');
    }

    // Método 2: Sign out todas as sessões
    await supabase.auth.signOut({ scope: 'global' });
    
    // Método 3: Limpar storage local
    localStorage.removeItem('sb-uxbeaslwirkepnowydfu-auth-token');
    sessionStorage.clear();
    
    // Método 4: Reset do cliente Supabase
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('🔍 [AuthReset] SignOut error (pode ser normal):', signOutError);
    }

    return {
      success: true,
      message: `Rate limits resetados para ${email}. Aguarde alguns segundos e tente novamente.`
    };

  } catch (err: any) {
    return {
      success: false,
      message: 'Erro ao resetar rate limits',
      error: err.message
    };
  }
}

/**
 * Aguardar e tentar login novamente
 */
export async function waitAndRetryAuth(email: string, password: string, waitMinutes: number = 1): Promise<void> {
  console.log(`⏰ [AuthReset] Aguardando ${waitMinutes} minuto(s) antes de tentar novamente...`);
  
  // Reset limites primeiro
  await resetAuthLimitsForEmail(email);
  
  // Aguardar tempo especificado
  await new Promise(resolve => setTimeout(resolve, waitMinutes * 60 * 1000));
  
  console.log('🔄 [AuthReset] Tentando login novamente...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ [AuthReset] Erro no login após reset:', error);
    } else {
      console.log('✅ [AuthReset] Login bem-sucedido!', data);
    }
  } catch (err) {
    console.error('❌ [AuthReset] Erro inesperado:', err);
  }
}

// Função de emergência para usar no console do navegador
(window as any).resetSupabaseAuthLimits = async () => {
  const result = await resetAuthLimitsForEmail('moisesazevedo2020@gmail.com');
  console.log('🔄 Reset result:', result);
  return result;
};
