/**
 * Debug helper for Admin Registration issues
 * Responsabilidade: Diagnosticar problemas na criação de administradores
 */

import { supabase } from '../../../lib/supabase';

export interface AdminDebugInfo {
  authUserExists: boolean;
  adminRecordExists: boolean;
  rolesTableExists: boolean;
  adminRoleExists: boolean;
  adminRoleId: string | null;
  constraint_violations: string[];
}

/**
 * Diagnostica problemas na criação de admin
 */
export async function diagnoseAdminRegistrationIssue(userId: string): Promise<AdminDebugInfo> {
  const debug: AdminDebugInfo = {
    authUserExists: false,
    adminRecordExists: false,
    rolesTableExists: false,
    adminRoleExists: false,
    adminRoleId: null,
    constraint_violations: []
  };

  try {
    // 1. Verificar se usuário existe no auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    debug.authUserExists = !!authUser && !authError;
    
    if (authError) {
      debug.constraint_violations.push(`Auth user error: ${authError.message}`);
    }

    // 2. Verificar se admin já existe na tabela admins
    const { data: adminExists, error: adminCheckError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    debug.adminRecordExists = !!adminExists;
    if (adminCheckError) {
      debug.constraint_violations.push(`Admin check error: ${adminCheckError.message}`);
    }

    // 3. Verificar se tabela roles existe e tem o role admin
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'admin')
      .maybeSingle();
    
    debug.rolesTableExists = !roleError || !roleError.message.includes('relation "roles" does not exist');
    debug.adminRoleExists = !!adminRole;
    debug.adminRoleId = adminRole?.id || null;
    
    if (roleError) {
      debug.constraint_violations.push(`Roles error: ${roleError.message}`);
    }

    // 4. Verificar constraints da tabela admins (opcional)
    /* 
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_constraints', {
      table_name: 'admins'
    });
    
    if (tableError) {
      debug.constraint_violations.push(`Table constraints error: ${tableError.message}`);
    }
    */

  } catch (err: any) {
    debug.constraint_violations.push(`General error: ${err.message}`);
  }

  return debug;
}

/**
 * Tenta resolver problemas conhecidos da criação de admin
 */
export async function attemptAdminRegistrationFix(userId: string): Promise<{
  success: boolean;
  error?: string;
  debug: AdminDebugInfo;
}> {
  const debug = await diagnoseAdminRegistrationIssue(userId);
  
  // Se usuário auth não existe, não podemos continuar
  if (!debug.authUserExists) {
    return {
      success: false,
      error: 'Usuário não existe no Supabase Auth',
      debug
    };
  }

  // Se admin já existe, considerar sucesso
  if (debug.adminRecordExists) {
    return {
      success: true,
      debug
    };
  }

  // Se role admin não existe, criar
  if (!debug.adminRoleExists) {
    try {
      const { data: createdRole, error: createRoleError } = await supabase
        .from('roles')
        .insert([
          {
            name: 'admin',
            description: 'Administrador com acesso total ao sistema'
          }
        ])
        .select()
        .single();

      if (createRoleError) {
        return {
          success: false,
          error: `Erro ao criar role admin: ${createRoleError.message}`,
          debug
        };
      }

      debug.adminRoleId = createdRole.id;
      debug.adminRoleExists = true;
    } catch (err: any) {
      return {
        success: false,
        error: `Erro ao criar role admin: ${err.message}`,
        debug
      };
    }
  }

  return {
    success: true,
    debug
  };
}
