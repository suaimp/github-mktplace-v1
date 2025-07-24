import { supabase } from "../../../lib/supabase";

/**
 * Serviços relacionados à definição de nova senha
 * Responsabilidade: Gerenciar operações de atualização de senha via Supabase Auth
 */

export interface UpdatePasswordParams {
  password: string;
  accessToken: string;
  refreshToken: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  error?: string;
}

export const updatePassword = async ({
  password,
  accessToken,
  refreshToken
}: UpdatePasswordParams): Promise<UpdatePasswordResponse> => {
  try {
    console.log('🔄 [PasswordRecoveryService] Iniciando updatePassword...');
    console.log('🔍 [PasswordRecoveryService] Tokens recebidos:', {
      accessTokenLength: accessToken.length,
      refreshTokenLength: refreshToken.length,
      passwordLength: password.length
    });

    // Definir a sessão usando os tokens do link de recuperação
    console.log('🔄 [PasswordRecoveryService] Definindo sessão...');
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (sessionError) {
      console.error('❌ [PasswordRecoveryService] Erro na sessão:', sessionError);
      throw new Error("Sessão inválida ou expirada. Solicite um novo link de recuperação.");
    }

    console.log('✅ [PasswordRecoveryService] Sessão definida com sucesso');

    // Atualizar a senha do usuário
    console.log('🔄 [PasswordRecoveryService] Atualizando senha...');
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      console.error('❌ [PasswordRecoveryService] Erro ao atualizar senha:', updateError);
      throw updateError;
    }

    console.log('✅ [PasswordRecoveryService] Senha atualizada com sucesso');

    // Fazer logout para forçar novo login com a nova senha
    console.log('🔄 [PasswordRecoveryService] Fazendo logout...');
    await supabase.auth.signOut();

    console.log('🎉 [PasswordRecoveryService] Processo completado com sucesso');
    return { success: true };
  } catch (error: any) {
    console.error("❌ [PasswordRecoveryService] Erro geral:", error);
    
    let errorMessage = "Erro ao definir nova senha. Tente novamente.";
    
    if (error.message?.includes("session")) {
      errorMessage = "Sessão expirada. Solicite um novo link de recuperação.";
    } else if (error.message?.includes("password")) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};
