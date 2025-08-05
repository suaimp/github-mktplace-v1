import { supabase } from '../../../../lib/supabase';

export interface AdminVerificationResult {
  isAdmin: boolean;
  userId: string | null;
  checks: {
    inAdminsTable: boolean;
    hasAdminRole: boolean;
    hasAdminRoleId: boolean;
  };
}

export async function verifyAdminStatus(): Promise<AdminVerificationResult> {
  try {
    // 1. Buscar usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        isAdmin: false,
        userId: null,
        checks: {
          inAdminsTable: false,
          hasAdminRole: false,
          hasAdminRoleId: false,
        }
      };
    }

    // 2. Verificar se está na tabela admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    console.log('Debug - Admins table query:', { adminData, adminError });
    const inAdminsTable = !!adminData;

    // 3. Buscar dados do usuário incluindo role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, role_id')
      .eq('id', user.id)
      .maybeSingle();
    
    console.log('Debug - Users table query:', { userData, userError });
    const hasAdminRole = userData?.role === 'admin';

    // 4. Verificar se o role_id corresponde ao role "admin"
    let hasAdminRoleId = false;
    if (userData?.role_id) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('id', userData.role_id)
        .eq('name', 'admin')
        .maybeSingle();
      
      console.log('Debug - Roles table query:', { roleData, roleError, roleId: userData.role_id });
      hasAdminRoleId = !!roleData;
    }

    // 5. Para ser admin, deve atender TODAS as condições
    const isAdmin = inAdminsTable && hasAdminRole && hasAdminRoleId;

    console.log('Debug - Admin Verification:', {
      userId: user.id,
      inAdminsTable,
      hasAdminRole,
      hasAdminRoleId,
      isAdmin
    });

    return {
      isAdmin,
      userId: user.id,
      checks: {
        inAdminsTable,
        hasAdminRole,
        hasAdminRoleId,
      }
    };

  } catch (error) {
    console.error('Erro ao verificar status de admin:', error);
    return {
      isAdmin: false,
      userId: null,
      checks: {
        inAdminsTable: false,
        hasAdminRole: false,
        hasAdminRoleId: false,
      }
    };
  }
}
