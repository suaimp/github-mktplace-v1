import { supabase } from '../../../lib/supabase';

export async function submitAdminRegister({
  firstName,
  lastName,
  email,
  password,
  phone
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  try {
    // Buscar o id do role admin
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .maybeSingle();
    if (roleError || !adminRole?.id) {
      return { success: false, error: 'Não foi possível encontrar o role de administrador.' };
    }

    // Verificar se já existe admin com o mesmo e-mail
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle();
    if (existing) {
      return { success: false, error: 'Este e-mail já está cadastrado como administrador.' };
    }

    // 1. Criar usuário no Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone?.trim() || '',
          role: 'admin',
          role_id: adminRole.id
        }
      }
    });
    if (signUpError) {
      if (signUpError.message?.toLowerCase().includes('user already registered') || signUpError.message?.toLowerCase().includes('email')) {
        return { success: false, error: 'Este e-mail já está cadastrado.' };
      }
      return { success: false, error: signUpError.message || 'Erro ao criar usuário.' };
    }
    if (!signUpData?.user) {
      return { success: false, error: 'Erro ao criar usuário.' };
    }
    const userId = signUpData.user.id;

    // 2. Inserir na tabela admins
    const { data: inserted, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          id: userId,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone?.trim() || '',
          role: 'admin',
          role_id: adminRole.id,
          is_first_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    if (adminError) {
      return { success: false, error: adminError.message || 'Erro ao cadastrar administrador.' };
    }
    if (!inserted) {
      return { success: false, error: 'Não foi possível cadastrar o administrador.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao cadastrar administrador.' };
  }
}

// Função para ser chamada após o login/validação do e-mail
export async function ensureAdminInAdminsTable({
  userId,
  email,
  firstName,
  lastName,
  phone
}: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  try {
    // Buscar o id do role admin
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .maybeSingle();
    if (roleError || !adminRole?.id) {
      throw new Error('Não foi possível encontrar o role de administrador.');
    }
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (existing) return { success: true };
    // Inserir na tabela admins
    const { error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          id: userId,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone?.trim() || '',
          role: 'admin',
          role_id: adminRole.id,
          is_first_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    if (adminError) throw adminError;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao inserir admin.' };
  }
} 