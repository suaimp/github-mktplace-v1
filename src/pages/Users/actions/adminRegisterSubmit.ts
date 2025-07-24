import { supabase } from '../../../lib/supabase';
import { diagnoseAdminRegistrationIssue, attemptAdminRegistrationFix } from '../debug/adminRegisterDebug';

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
      console.error('❌ [AdminRegister] Erro ao buscar role admin:', roleError);
      return { success: false, error: 'Não foi possível encontrar o role de administrador.' };
    }
    
    console.log('✅ [AdminRegister] Role admin encontrado:', adminRole.id);

    // Verificar se já existe admin com o mesmo e-mail
    console.log('🔍 [AdminRegister] Verificando se admin já existe...');
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle();
    if (existing) {
      console.log('⚠️ [AdminRegister] Admin já existe:', existing.id);
      return { success: false, error: 'Este e-mail já está cadastrado como administrador.' };
    }
    
    console.log('✅ [AdminRegister] Email disponível, prosseguindo...');

    // 1. Verificar se usuário já existe no Supabase Auth primeiro
    console.log('🔍 [AdminRegister] Verificando se usuário já existe no Auth...');
    
    let userId: string = '';
    let userAlreadyExists = false;
    
    // Tentar buscar usuário existente por email
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    
    if (existingAuthUsers && existingAuthUsers.users) {
      const existingUser = existingAuthUsers.users.find(user => user.email === email.trim());
      if (existingUser) {
        console.log('⚠️ [AdminRegister] Usuário já existe no Auth:', existingUser.id);
        userId = existingUser.id;
        userAlreadyExists = true;
      }
    }

    // Se usuário não existe no Auth, criar novo
    if (!userAlreadyExists) {
      console.log('🔍 [AdminRegister] Criando novo usuário no Supabase Auth...');
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
        console.error('❌ [AdminRegister] Erro ao criar usuário no Auth:', signUpError);
        if (signUpError.message?.toLowerCase().includes('user already registered') || signUpError.message?.toLowerCase().includes('email')) {
          return { success: false, error: 'Este e-mail já está cadastrado.' };
        }
        return { success: false, error: signUpError.message || 'Erro ao criar usuário.' };
      }
      
      if (!signUpData?.user) {
        console.error('❌ [AdminRegister] Usuário não foi criado no Auth');
        return { success: false, error: 'Erro ao criar usuário.' };
      }
      
      userId = signUpData.user.id;
      console.log('✅ [AdminRegister] Novo usuário criado no Auth:', userId);
    }

    // 2. Verificar se admin já existe na tabela admins
    console.log('🔍 [AdminRegister] Verificando se admin já existe na tabela...');
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (existingAdmin) {
      console.log('⚠️ [AdminRegister] Admin já existe na tabela:', existingAdmin.id);
      return { success: false, error: 'Este usuário já está cadastrado como administrador.' };
    }

    // 3. Inserir na tabela admins
    console.log('🔍 [AdminRegister] Inserindo admin na tabela admins...');
    console.log('🔍 [AdminRegister] Dados:', {
      id: userId,
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone?.trim() || '',
      role: 'admin',
      role_id: adminRole.id
    });

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
      console.error('❌ [AdminRegister] Erro ao inserir admin:', adminError);
      
      // Fazer diagnóstico detalhado do erro
      console.log('🔍 [AdminRegister] Iniciando diagnóstico...');
      const debugInfo = await diagnoseAdminRegistrationIssue(userId);
      console.log('🔍 [AdminRegister] Debug info:', debugInfo);
      
      // Tentar corrigir automaticamente problemas conhecidos
      if (debugInfo.constraint_violations.length > 0) {
        console.log('🔧 [AdminRegister] Tentando correção automática...');
        const fixResult = await attemptAdminRegistrationFix(userId);
        console.log('🔧 [AdminRegister] Resultado da correção:', fixResult);
        
        if (fixResult.success) {
          // Tentar inserir novamente após correção
          const { error: retryError } = await supabase
            .from('admins')
            .insert([
              {
                id: userId,
                email: email.trim(),
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                phone: phone?.trim() || '',
                role: 'admin',
                role_id: fixResult.debug.adminRoleId,
                is_first_admin: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select()
            .single();
            
          if (retryError) {
            return { success: false, error: `Erro após correção: ${retryError.message}` };
          }
          
          console.log('✅ [AdminRegister] Admin inserido após correção!');
          return { success: true };
        }
      }
      
      return { success: false, error: adminError.message || 'Erro ao cadastrar administrador.' };
    }

    if (!inserted) {
      return { success: false, error: 'Não foi possível cadastrar o administrador.' };
    }

    console.log('✅ [AdminRegister] Admin cadastrado com sucesso:', inserted.id);

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