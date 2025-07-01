import { ReactNode, useEffect, useState } from 'react';
import { hasPermission } from '../../lib/permissions';
import { supabase } from '../../lib/supabase';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, [permission]);

  async function checkPermission() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasAccess(false);
        return;
      }

      const allowed = await hasPermission(user.id, permission);
      setHasAccess(allowed);
      
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export function AdminRoleGuard({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminRole();
  }, []);

  async function checkAdminRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      // Buscar o id do role admin
      const { data: adminRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "admin")
        .maybeSingle();
      if (!adminRole?.id) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      // Verificar se está na tabela admins
      const { data: adminData } = await supabase
        .from("admins")
        .select("role, role_id")
        .eq("id", user.id)
        .maybeSingle();
      if (adminData && adminData.role === "admin" && adminData.role_id === adminRole.id) {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      // Verificar se está na tabela platform_users
      const { data: platformData } = await supabase
        .from("platform_users")
        .select("role, role_id")
        .eq("id", user.id)
        .maybeSingle();
      if (platformData && platformData.role === "admin" && platformData.role_id === adminRole.id) {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      setHasAccess(false);
      setLoading(false);
    } catch (error) {
      setHasAccess(false);
      setLoading(false);
    }
  }

  if (loading) return null;
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}